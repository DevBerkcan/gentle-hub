import { cn } from "@/lib/cn";
import { ENVIRONMENTS, PROJECT_STATUSES, type StatusKey } from "@/lib/constants";
import type { AssetEnvironment, ProjectStatus } from "@/lib/types";

export function StatusBadge({
  status,
  className,
}: {
  status: ProjectStatus | StatusKey;
  className?: string;
}) {
  const meta = PROJECT_STATUSES[status] ?? PROJECT_STATUSES.paused;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
        meta.badge,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}

export function EnvironmentBadge({
  environment,
  className,
}: {
  environment: AssetEnvironment | null | undefined;
  className?: string;
}) {
  if (!environment) return null;
  const meta = ENVIRONMENTS[environment];
  if (!meta) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset",
        meta.badge,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}

export function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-medium text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
