import Link from "next/link";
import { cn } from "@/lib/cn";

const tones = {
  neutral: "bg-surface-2 text-[#475467]",
  accent: "bg-[#ecfdf5] text-[#0f766e]",
} as const;

export function StatCard({
  label,
  value,
  hint,
  icon,
  href,
  tone = "neutral",
}: {
  label: string;
  value: number;
  hint: string;
  icon: React.ReactNode;
  href?: string;
  tone?: keyof typeof tones;
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-[7px]", tones[tone])}>
          {icon}
        </span>
        {href && (
          <span className="text-[10px] font-semibold text-subtle transition group-hover:text-ink">
            Ansehen →
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-[24px] font-semibold leading-none tracking-[-0.03em] text-ink tabular-nums">
        {value}
      </p>
      <p className="mt-1.5 text-[11.5px] font-semibold text-ink">{label}</p>
      <p className="mt-0.5 text-[10px] leading-relaxed text-muted">{hint}</p>
    </>
  );

  const className =
    "group rounded-[12px] border border-line bg-surface p-3.5 shadow-card transition hover:border-line-strong";

  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}
