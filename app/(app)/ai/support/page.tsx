import type { Metadata } from "next";
import Link from "next/link";
import { getSupportData } from "@/lib/data";
import { cn } from "@/lib/cn";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { AgentAvatar } from "@/components/ai/agent-avatar";
import { SupportTicketCard } from "@/components/ai/support-tickets";
import { IconCheck } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Support" };

type Search = { status?: string | string[]; ticket?: string | string[] };

const FILTERS = [
  { key: "active", label: "Offen & in Arbeit" },
  { key: "done", label: "Erledigt" },
  { key: "all", label: "Alle" },
] as const;

export default async function SupportPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const raw = Array.isArray(params.status) ? params.status[0] : params.status;
  const filter = FILTERS.some((f) => f.key === raw) ? (raw as (typeof FILTERS)[number]["key"]) : "active";
  const highlight = Array.isArray(params.ticket) ? params.ticket[0] : params.ticket;
  const { items, active } = await getSupportData(filter === "all" ? undefined : filter);
  const critical = items.filter((t) => t.severity === "critical" && t.status !== "done").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4">
        <AgentAvatar
          agentId="support-triage"
          size={88}
          state={critical > 0 ? "alert" : active > 0 ? "working" : "idle"}
          title="Support-Agent"
          className="hidden sm:block"
        />
        <div className="min-w-0 flex-1">
          <PageHeader
            eyebrow="AI Operations"
            title="Support"
            description="Der Support-Agent sortiert Mails von Bestandskunden in Tickets: Ausfall, Fehler, Änderungswunsch oder Frage, mit Dringlichkeit und Projekt. Notfälle kommen sofort per Telegram, Änderungswünsche laufen in die Schätzung."
          />
        </div>
      </div>

      <nav className="flex flex-wrap items-center gap-1.5" aria-label="Filter">
        {FILTERS.map((option) => (
          <Link
            key={option.key}
            href={option.key === "active" ? "/ai/support" : `/ai/support?status=${option.key}`}
            className={cn("chip", filter === option.key && "bg-navy text-white")}
          >
            {option.label}
            {option.key === "active" && <span className="ml-1 tabular-nums opacity-70">{active}</span>}
          </Link>
        ))}
      </nav>

      {items.length === 0 ? (
        <EmptyState
          icon={<IconCheck className="h-4 w-4" />}
          title={filter === "active" ? "Keine offenen Tickets" : "Keine Tickets"}
          description="Sobald ein Kunde einen Fehler, Ausfall oder Änderungswunsch per Mail meldet, legt der Support-Agent hier ein Ticket an."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((ticket) => (
            <SupportTicketCard key={ticket.id} ticket={ticket} highlight={ticket.id === highlight} />
          ))}
        </div>
      )}
    </div>
  );
}
