import { cn } from "@/lib/cn";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  compact = false,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[12px] border border-dashed border-line-strong bg-surface px-6 text-center",
        compact ? "py-8" : "py-14",
        className,
      )}
    >
      {icon && (
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[8px] bg-surface-2 text-muted">
          {icon}
        </div>
      )}
      <p className="font-display text-[13.5px] font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-[12px] leading-relaxed text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
