import { cn } from "@/lib/cn";
import { JOB_STATUSES, RUN_STATUSES } from "@/lib/ai-format";
import type { AgentRunStatus, JobStatus } from "@/lib/types";

const base = "inline-flex items-center gap-1 rounded-[5px] px-1.5 py-0.5 text-[9.5px] font-semibold ring-1 ring-inset";

export function RunStatusBadge({ status, className }: { status: AgentRunStatus; className?: string }) {
  const meta = RUN_STATUSES[status] ?? RUN_STATUSES.failed;
  return (
    <span className={cn(base, meta.badge, className)}>
      <span className={cn("h-1 w-1 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}

export function JobStatusBadge({ status, className }: { status: JobStatus; className?: string }) {
  const meta = JOB_STATUSES[status] ?? JOB_STATUSES.failed;
  return (
    <span className={cn(base, meta.badge, className)}>
      <span className={cn("h-1 w-1 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}

export function DryRunBadge({ className }: { className?: string }) {
  return (
    <span className={cn(base, "bg-accent-soft text-accent ring-accent/30", className)} title="Keine echten KI-Aufrufe, keine Kosten">
      Testmodus
    </span>
  );
}
