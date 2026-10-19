import { cn } from "@/lib/cn";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
            {eyebrow}
          </p>
        )}
        <h1 className="text-balance font-display text-[24px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[28px]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-muted sm:text-[13px]">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}
