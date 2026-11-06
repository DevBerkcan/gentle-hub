import Link from "next/link";
import { persona } from "@/lib/agent-personas";
import { formatDuration, formatEur, formatTokens } from "@/lib/ai-format";
import { formatDateTime, formatRelative } from "@/lib/format";
import type { Agent, AgentRun } from "@/lib/types";
import { DryRunBadge, RunStatusBadge } from "@/components/ai/status-badges";
import { EmptyState } from "@/components/ui/empty-state";
import { IconActivity } from "@/components/ui/icons";

export function RunList({
  runs,
  agents,
  emptyTitle = "Noch keine Agentenläufe",
  showAgent = true,
}: {
  runs: AgentRun[];
  agents?: Agent[];
  emptyTitle?: string;
  showAgent?: boolean;
}) {
  if (runs.length === 0) {
    return (
      <EmptyState
        compact
        icon={<IconActivity className="h-4 w-4" />}
        title={emptyTitle}
        description="Läufe erscheinen hier, sobald ein Agent über die Job-Queue gearbeitet hat."
      />
    );
  }

  const names = new Map((agents ?? []).map((agent) => [agent.id, `${persona(agent.id, agent.name).firstName} · ${agent.name}`]));

  return (
    <ul className="card divide-y divide-line">
      {runs.map((run) => (
        <li key={run.id}>
          <details className="group">
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-3 hover:bg-surface-2/60">
              <RunStatusBadge status={run.status} />
              {showAgent && (
                <Link
                  href={`/ai/agents/${encodeURIComponent(run.agentId)}`}
                  className="text-[12.5px] font-semibold text-ink hover:underline"
                >
                  {names.get(run.agentId) ?? run.agentId}
                </Link>
              )}
              <span className="min-w-0 flex-1 truncate text-[12px] text-muted">{run.inputSummary ?? "–"}</span>
              {run.isDryRun && <DryRunBadge />}
              <span className="text-[11px] tabular-nums text-muted">{formatEur(run.costEur)}</span>
              <time className="text-[11px] text-subtle" dateTime={run.startedAt} title={formatDateTime(run.startedAt)}>
                {formatRelative(run.startedAt)}
              </time>
            </summary>
            <div className="border-t border-line bg-surface-2/40 px-4 py-3 text-[11.5px]">
              <dl className="grid gap-x-6 gap-y-1.5 sm:grid-cols-3">
                <Meta label="Modell">
                  {run.provider} · {run.model}
                </Meta>
                <Meta label="Systemanweisung">v{run.promptVersion}</Meta>
                <Meta label="Dauer">{formatDuration(run.durationMs)}</Meta>
                <Meta label="Tokens (Ein/Aus)">
                  {formatTokens(run.inputTokens)} / {formatTokens(run.outputTokens)}
                </Meta>
                <Meta label="Kosten">{formatEur(run.costEur)}</Meta>
                <Meta label="Lauf-ID">
                  <span className="font-mono text-[10px]">{run.id}</span>
                </Meta>
              </dl>
              {run.error && (
                <p className="mt-3 rounded-[8px] border border-rose-200 bg-rose-50 px-3 py-2 text-[11.5px] text-rose-800">
                  {run.error}
                </p>
              )}
              {run.outputJson && (
                <pre className="mt-3 max-h-80 overflow-auto rounded-[8px] border border-line bg-surface p-3 font-mono text-[10.5px] leading-relaxed text-ink-2">
                  {prettyJson(run.outputJson)}
                </pre>
              )}
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[9.5px] font-semibold uppercase tracking-wide text-subtle">{label}</dt>
      <dd className="mt-0.5 font-medium text-ink">{children}</dd>
    </div>
  );
}

function prettyJson(value: string): string {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}
