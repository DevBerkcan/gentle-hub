import Link from "next/link";
import { cn } from "@/lib/cn";
import { IconChevronRight } from "@/components/ui/icons";

export function SectionHeader({
  title,
  description,
  href,
  linkLabel = "Alle ansehen",
  action,
  className,
}: {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        <h2 className="font-display text-[17px] font-bold tracking-[-0.02em] text-ink">{title}</h2>
        {description && <p className="mt-0.5 text-[12.5px] text-muted">{description}</p>}
      </div>
      {action ??
        (href ? (
          <Link
            href={href}
            className="group inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold text-muted transition hover:text-ink"
          >
            {linkLabel}
            <IconChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </Link>
        ) : null)}
    </div>
  );
}
