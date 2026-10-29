import type { Metadata } from "next";
import Link from "next/link";
import { getAiAgentsData, getAiJobsData, getAiRunsData } from "@/lib/data";
import { JOB_TYPE_LABELS } from "@/lib/ai-format";
import { formatDateTime, formatRelative } from "@/lib/format";
import { cn } from "@/lib/cn";
import { PageHeader } from "@/components/ui/page-header";
import { RunList } from "@/components/ai/run-list";
import { JobStatusBadge } from "@/components/ai/status-badges";
import { JobActions } from "@/components/ai/ai-buttons";
import { EmptyState } from "@/components/ui/empty-state";
import { IconClock } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Workflow-Historie" };

const FILTERS = [
  { key: "", label: "Alle" },
  { key: "succeeded", label: "Erfolgreich" },
  { key: "problem", label: "Probleme" },
] as const;

export default async function AiHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[]; agent?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawStatus = Array.isArray(params.status) ? params.status[0] : params.status;
  const status = FILTERS.some((filter) => filter.key === rawStatus) ? rawStatus : undefined;
  const agentId = Array.isArray(params.agent) ? params.agent[0] : params.agent;

  const [agents, runs, jobs] = await Promise.all([
    getAiAgentsData(),
    getAiRunsData(agentId || undefined, status || undefined),
    getAiJobsData(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="AI Operations"
        title="Workflow-Historie"
        description="Jeder Agentenlauf und jeder Hintergrundjob wird einzeln protokolliert, inklusive Fehlern, Wiederholungen und Kosten."
      />

      <section className="flex flex-col gap-3" aria-labelledby="history-runs-heading">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="history-runs-heading" className="text-[14px] font-semibold text-ink">
            Agentenläufe
          </h2>
          <nav className="flex gap-1" aria-label="Filter">
            {FILTERS.map((filter) => {
              const active = (status ?? "") === filter.key;
              const query = new URLSearchParams();
              if (filter.key) query.set("status", filter.key);
              if (agentId) query.set("agent", agentId);
              const href = query.size > 0 ? `/ai/history?${query.toString()}` : "/ai/history";
              return (
                <Link
                  key={filter.key || "all"}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn("chip", active && "bg-navy text-white")}
                >
                  {filter.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <RunList runs={runs} agents={agents} />
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="history-jobs-heading">
        <h2 id="history-jobs-heading" className="text-[14px] font-semibold text-ink">
          Hintergrundjobs
        </h2>
        {jobs.length === 0 ? (
          <EmptyState compact icon={<IconClock className="h-4 w-4" />} title="Noch keine Jobs" />
        ) : (
          <ul className="card divide-y divide-line">
            {jobs.map((job) => (
              <li key={job.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-3">
                <JobStatusBadge status={job.status} />
                <span className="text-[12.5px] font-semibold text-ink">{JOB_TYPE_LABELS[job.type] ?? job.type}</span>
                <span className="text-[11px] text-muted">
                  Versuch {job.attempts}/{job.maxAttempts}
                </span>
                {job.status === "queued" && job.attempts > 0 && (
                  <span className="text-[11px] text-muted">nächster Versuch {formatRelative(job.runAfter)}</span>
                )}
                {job.lastError && <span className="min-w-0 flex-1 truncate text-[11px] text-rose-600" title={job.lastError}>{job.lastError}</span>}
                <span className="ml-auto flex items-center gap-2">
                  <JobActions
                    jobId={job.id}
                    canRetry={job.status === "failed" || job.status === "dead" || job.status === "cancelled"}
                    canCancel={job.status === "queued"}
                  />
                  <time className="text-[11px] text-subtle" dateTime={job.createdAt} title={formatDateTime(job.createdAt)}>
                    {formatRelative(job.createdAt)}
                  </time>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
