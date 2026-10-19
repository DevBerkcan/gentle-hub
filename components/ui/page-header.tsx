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
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-mint-strong" />
            {eyebrow}
          </p>
        )}
        <h1 className="text-balance font-display text-[27px] font-extrabold leading-[1.1] tracking-[-0.035em] text-ink sm:text-[31px]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted sm:text-[13.5px]">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}
