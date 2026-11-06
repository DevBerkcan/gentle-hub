import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatEur, TRIGGER_LABELS } from "@/lib/ai-format";
import { formatRelative } from "@/lib/format";
import type { Agent } from "@/lib/types";
import { IconChevronRight } from "@/components/ui/icons";
import { AgentAvatar } from "@/components/ai/agent-avatar";

export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link
      href={`/ai/agents/${encodeURIComponent(agent.id)}`}
      className="group card flex flex-col gap-3 p-4 transition hover:border-line-strong"
    >
      <div className="flex items-start gap-3">
        <AgentAvatar agentId={agent.id} size={52} state={agent.isEnabled ? "idle" : "off"} title={agent.name} className="-my-1" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-[13px] font-semibold text-ink">
            <span className="truncate">{agent.name}</span>
            <span
              className={cn(
                "rounded-[5px] px-1.5 py-0.5 text-[9.5px] font-semibold",
                agent.isEnabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600",
              )}
            >
              {agent.isEnabled ? "Aktiv" : "Aus"}
            </span>
          </p>
          <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-relaxed text-muted">{agent.description}</p>
        </div>
        <IconChevronRight className="mt-1 h-4 w-4 shrink-0 text-subtle transition group-hover:text-ink" />
      </div>
      <dl className="grid grid-cols-3 gap-2 border-t border-line pt-3 text-[10.5px]">
        <div>
          <dt className="text-subtle">Läufe (Monat)</dt>
          <dd className="font-semibold tabular-nums text-ink">
            {agent.month.runs}
            {agent.month.failedRuns > 0 && (
              <span className="ml-1 font-medium text-rose-600">· {agent.month.failedRuns} Fehler</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-subtle">Kosten</dt>
          <dd className="font-semibold tabular-nums text-ink">
            {formatEur(agent.month.costEur)}
            {agent.monthlyBudgetEur != null && (
              <span className="font-normal text-muted"> / {formatEur(agent.monthlyBudgetEur)}</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-subtle">Zuletzt</dt>
          <dd className="font-semibold text-ink">{formatRelative(agent.month.lastRunAt)}</dd>
        </div>
      </dl>
      <p className="text-[10px] text-subtle">
        Auslöser: {TRIGGER_LABELS[agent.triggerType] ?? agent.triggerType} · Modell {agent.model} · Anweisung v
        {agent.promptVersion}
      </p>
    </Link>
  );
}
