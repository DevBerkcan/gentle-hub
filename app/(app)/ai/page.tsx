import type { Metadata } from "next";
import Link from "next/link";
import { getAiOverviewData, getEmailsData } from "@/lib/data";
import { formatEur } from "@/lib/ai-format";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { AgentCard } from "@/components/ai/agent-card";
import { EmailList } from "@/components/ai/email-list";
import { BudgetMeter } from "@/components/ai/budget-meter";
import { RunList } from "@/components/ai/run-list";
import { DryRunBadge } from "@/components/ai/status-badges";
import { IconActivity, IconAlert, IconArrowRight, IconCheck, IconClock, IconSparkles } from "@/components/ui/icons";

export const metadata: Metadata = { title: "AI Operations" };

export default async function AiDashboardPage() {
  const [overview, emails] = await Promise.all([getAiOverviewData(), getEmailsData()]);
  const { settings, budget, agents, jobs } = overview;
  const runsThisMonth = agents.reduce((sum, agent) => sum + agent.month.runs, 0);
  const failuresThisMonth = agents.reduce((sum, agent) => sum + agent.month.failedRuns, 0);
  const openJobs = (jobs.queued ?? 0) + (jobs.running ?? 0);
  const brokenJobs = (jobs.failed ?? 0) + (jobs.dead ?? 0);

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        eyebrow="AI Operations"
        title="Agenten-Übersicht"
        description="Was die Agenten vorbereitet haben, was wartet, wo es gehakt hat und was es gekostet hat."
        action={
          <>
            {settings.isDryRun && <DryRunBadge className="text-[11px]" />}
            {!settings.processingEnabled && (
              <span className="rounded-[6px] bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800">
                Verarbeitung pausiert
              </span>
            )}
            <Link href="/ai/settings" className="btn btn-ghost">
              Einstellungen
              <IconArrowRight className="h-3.5 w-3.5" />
            </Link>
          </>
        }
      />

      {settings.isDryRun && (
        <p className="rounded-[10px] border border-accent/30 bg-accent-soft px-4 py-3 text-[12px] leading-relaxed text-ink">
          <strong>Testmodus aktiv:</strong> Agenten liefern feste Testergebnisse, es werden keine echten KI-Anbieter
          aufgerufen und keine Kosten verursacht. Ein echter Anbieter wird serverseitig konfiguriert.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="Agentenläufe"
          value={runsThisMonth}
          hint="In diesem Monat"
          icon={<IconActivity className="h-4 w-4" />}
          href="/ai/history"
          tone="accent"
        />
        <StatCard
          label="Offene Freigaben"
          value={overview.pendingApprovals}
          hint="Schätzungen und Entwürfe zur Prüfung"
          icon={<IconCheck className="h-4 w-4" />}
          href="/ai/approvals"
        />
        <StatCard
          label="Wartende Jobs"
          value={openJobs}
          hint={brokenJobs > 0 ? `${brokenJobs} fehlgeschlagen` : "Job-Queue in SQL Server"}
          icon={<IconClock className="h-4 w-4" />}
          href="/ai/history"
        />
        <StatCard
          label="Fehler"
          value={failuresThisMonth}
          hint={`KI-Kosten: ${formatEur(budget.spentEur)}`}
          icon={<IconAlert className="h-4 w-4" />}
          href="/ai/history?status=problem"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="flex flex-col gap-3" aria-labelledby="agents-heading">
          <div className="flex items-center justify-between">
            <h2 id="agents-heading" className="text-[14px] font-semibold text-ink">
              Agenten
            </h2>
            <Link href="/ai/agents" className="text-[11.5px] font-semibold text-muted hover:text-ink">
              Alle verwalten →
            </Link>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </section>

        <aside className="flex flex-col gap-5">
          <BudgetMeter budget={budget} />
          <Link href="/ai/costs" className="card flex items-center gap-3 p-4 text-[12px] font-medium text-ink hover:border-line-strong">
            <IconSparkles className="h-4 w-4 text-accent" />
            Kosten je Agent ansehen
            <IconArrowRight className="ml-auto h-3.5 w-3.5 text-subtle" />
          </Link>
        </aside>
      </div>

      <section className="flex flex-col gap-3" aria-labelledby="inbox-heading">
        <div className="flex items-center justify-between">
          <h2 id="inbox-heading" className="text-[14px] font-semibold text-ink">
            Posteingang
          </h2>
          <Link href="/ai/emails" className="text-[11.5px] font-semibold text-muted hover:text-ink">
            Alle E-Mails →
          </Link>
        </div>
        <EmailList
          emails={emails.slice(0, 6)}
          emptyDescription="Sobald ein verbundenes Postfach abgerufen wurde, erscheinen die neuesten Mails hier – mit dem Stand der Agenten-Analyse."
        />
      </section>

      {overview.recentFailures.length > 0 && (
        <section className="flex flex-col gap-3" aria-labelledby="failures-heading">
          <h2 id="failures-heading" className="text-[14px] font-semibold text-ink">
            Letzte Fehler
          </h2>
          <RunList runs={overview.recentFailures} agents={agents} />
        </section>
      )}

      <section className="flex flex-col gap-3" aria-labelledby="runs-heading">
        <div className="flex items-center justify-between">
          <h2 id="runs-heading" className="text-[14px] font-semibold text-ink">
            Letzte Agentenläufe
          </h2>
          <Link href="/ai/history" className="text-[11.5px] font-semibold text-muted hover:text-ink">
            Workflow-Historie →
          </Link>
        </div>
        <RunList runs={overview.recentRuns} agents={agents} />
      </section>
    </div>
  );
}
