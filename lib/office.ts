import type { OfficeAgent, OfficeFlow, OfficeRoom } from "@/components/ai/office/office-scene";
import { persona } from "@/lib/agent-personas";
import type { AiOverview, ApprovalListItem, MonitorOverview, SupportTicket } from "@/lib/types";

/** An agent counts as working if it ran within this window. */
const WORKING_MS = 5 * 60 * 1000;

function recent(value?: string | null, now = Date.now()) {
  return Boolean(value) && now - new Date(value!).getTime() < WORKING_MS;
}

/** Maps live AI data onto the four office rooms. */
export function buildOffice(
  overview: AiOverview,
  approvals: ApprovalListItem[],
  support: { items: SupportTicket[]; active: number },
  monitoring: MonitorOverview,
): { rooms: OfficeRoom[]; flows: OfficeFlow[] } {
  const now = Date.now();
  const byId = new Map(overview.agents.map((agent) => [agent.id, agent]));

  function agent(id: string): OfficeAgent | null {
    const data = byId.get(id);
    if (!data) return null;
    return {
      id,
      name: `${persona(id, data.name).firstName} · ${data.name}`,
      enabled: data.isEnabled,
      working: data.isEnabled && recent(data.month.lastRunAt, now),
      alert: id === "support-triage" && support.items.some((t) => t.severity === "critical" && t.status !== "done"),
      href: `/ai/agents/${encodeURIComponent(id)}`,
    };
  }

  const list = (...ids: string[]) => ids.map(agent).filter((a): a is OfficeAgent => a !== null);
  const runs = (...ids: string[]) => ids.reduce((sum, id) => sum + (byId.get(id)?.month.runs ?? 0), 0);
  const estimateApprovals = approvals.filter((a) => a.kind === "estimate").length;
  const replyApprovals = approvals.filter((a) => a.kind === "reply").length;
  const { summary } = monitoring;

  const monitor: OfficeAgent = {
    id: "website-monitor",
    name: "Kaan · Website-Wächter",
    enabled: summary.total > 0,
    // A check round takes well under a minute; right after one it counts as working.
    working: Boolean(summary.lastRunAt) && now - new Date(summary.lastRunAt!).getTime() < 90_000,
    alert: summary.down > 0,
    href: "/ai/monitoring",
  };

  const rooms: OfficeRoom[] = [
    {
      key: "inbox",
      title: "Posteingang",
      icon: "📥",
      color: "#3b82f6",
      href: "/ai/emails",
      agents: list("email-intelligence", "crm-matching", "voice-notes"),
      subtitle: `3 Agenten · ${runs("email-intelligence", "crm-matching", "voice-notes")} Läufe im Monat`,
      active: false,
    },
    {
      key: "offers",
      title: "Angebote",
      icon: "💶",
      color: "#10b981",
      href: "/ai/approvals",
      agents: list("lead-check", "project-notes", "estimation"),
      subtitle: `3 Agenten · ${estimateApprovals} ${estimateApprovals === 1 ? "Freigabe" : "Freigaben"} offen`,
      active: false,
    },
    {
      key: "comms",
      title: "Kundenkommunikation",
      icon: "✉️",
      color: "#f43f5e",
      href: "/ai/approvals",
      agents: list("reply-drafter", "draft-review", "follow-up", "customer-report"),
      subtitle: `4 Agenten · ${replyApprovals} ${replyApprovals === 1 ? "Mail" : "Mails"} zur Freigabe`,
      active: false,
    },
    {
      key: "ops",
      title: "Support & Betrieb",
      icon: "🛠️",
      color: "#f97316",
      href: "/ai/support",
      agents: [...list("support-triage"), monitor, ...list("daily-briefing")],
      subtitle: `${support.active} ${support.active === 1 ? "Ticket" : "Tickets"} · ${summary.down > 0 ? `${summary.down} Seite(n) down` : `${summary.up}/${summary.total} Seiten online`}`,
      active: false,
    },
  ];

  for (const room of rooms) {
    room.active = room.agents.some((a) => a.working || a.alert);
  }

  const activeRoom = new Map(rooms.map((room) => [room.key, room.active]));
  const flows: OfficeFlow[] = [
    { from: "inbox", to: "offers", active: Boolean(activeRoom.get("offers")) },
    { from: "offers", to: "comms", active: Boolean(activeRoom.get("comms")) },
    { from: "inbox", to: "ops", active: Boolean(activeRoom.get("ops")) },
  ];

  return { rooms, flows };
}
