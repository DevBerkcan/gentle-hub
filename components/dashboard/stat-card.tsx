import Link from "next/link";
import { cn } from "@/lib/cn";

const tones = {
  mint: "bg-[#e6fff7] text-[#007a52]",
  violet: "bg-[#f2eaff] text-[#6633c7]",
  blue: "bg-[#e8efff] text-[#2c58b8]",
  amber: "bg-[#fff3dd] text-[#8d5a00]",
  rose: "bg-[#ffe8ee] text-[#a52545]",
} as const;

export function StatCard({
  label,
  value,
  hint,
  icon,
  href,
  tone = "mint",
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
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-[10px]", tones[tone])}>
          {icon}
        </span>
        {href && (
          <span className="text-[10px] font-semibold text-subtle transition group-hover:text-ink">
            Ansehen →
          </span>
        )}
      </div>
      <p className="mt-4 font-display text-[28px] font-extrabold leading-none tracking-[-0.04em] text-ink tabular-nums">
        {value}
      </p>
      <p className="mt-1.5 text-[12.5px] font-semibold text-ink">{label}</p>
      <p className="mt-0.5 text-[10.5px] leading-relaxed text-muted">{hint}</p>
    </>
  );

  const className =
    "group rounded-[18px] border border-line bg-surface p-4 shadow-card transition hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[0_16px_34px_-24px_rgb(11_16_42/0.3)]";

  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}
