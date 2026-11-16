import type { Metadata } from "next";
import Link from "next/link";
import { getAiAgentsData } from "@/lib/data";
import { PageHeader } from "@/components/ui/page-header";
import { AgentCard } from "@/components/ai/agent-card";
import { AgentAvatar } from "@/components/ai/agent-avatar";
import { AGENT_PERSONAS, TEAMS, TEAM_EXTRAS, persona } from "@/lib/agent-personas";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Agenten" };

export default async function AiAgentsPage() {
  const agents = await getAiAgentsData();
  const known = new Set(agents.map((agent) => agent.id));
  const order = Object.keys(AGENT_PERSONAS);
  const rank = (id: string) => (order.indexOf(id) + order.length + 1) % (order.length + 1);
  agents.sort((a, b) => rank(a.id) - rank(b.id));

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="AI Operations"
        title="Agenten"
        description="Vier Teams: Projektleitung, Entwicklung, Büro und Vertrieb. Jeder Agent läuft serverseitig mit eigener Anweisung, Berechtigungen und Budget. Nichts geht ohne Freigabe an Kunden."
      />
      {TEAMS.map((team) => {
        const members = agents.filter((agent) => (AGENT_PERSONAS[agent.id]?.team ?? "buero") === team.key);
        const extras = TEAM_EXTRAS.filter((extra) => persona(extra.id).team === team.key && !known.has(extra.id));
        if (members.length === 0 && extras.length === 0) return null;
        return (
          <section key={team.key} className="flex flex-col gap-3" aria-labelledby={`team-${team.key}`}>
            <div>
              <h2 id={`team-${team.key}`} className="text-[14px] font-semibold text-ink">
                {team.title}
                <span className="ml-2 text-[11px] font-medium text-muted">{members.length + extras.length} Kolleg:innen</span>
              </h2>
              <p className="text-[11.5px] text-muted">{team.description}</p>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {members.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
              {extras.map((extra) => {
                const who = persona(extra.id);
                const body = (
                  <>
                    <AgentAvatar agentId={extra.id} size={44} state={extra.planned ? "off" : "idle"} title={`${who.firstName} · ${who.role}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-ink">
                        {who.firstName}
                        <span className="ml-1.5 font-medium text-muted">{who.role}</span>
                        <span
                          className={cn(
                            "ml-2 rounded-[5px] px-1.5 py-0.5 text-[9.5px] font-semibold",
                            extra.planned ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600",
                          )}
                        >
                          {extra.planned ? "Geplant" : "Ohne KI"}
                        </span>
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-muted">{extra.note}</p>
                    </div>
                  </>
                );
                return extra.href ? (
                  <Link key={extra.id} href={extra.href} className="card flex items-center gap-3 p-4 transition hover:border-line-strong">
                    {body}
                  </Link>
                ) : (
                  <div key={extra.id} className="card flex items-center gap-3 border-dashed p-4 opacity-80">
                    {body}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
