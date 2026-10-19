import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid h-9 w-9 shrink-0 grid-cols-2 gap-[3px] rounded-[11px] bg-mint p-[8px] shadow-[inset_0_0_0_1px_rgb(1_10_48/0.08),0_6px_18px_-8px_rgb(1_255_169/0.7)]",
        className,
      )}
    >
      <span className="rounded-[2.5px] bg-navy" />
      <span className="rounded-[2.5px] bg-navy/35" />
      <span className="rounded-[2.5px] bg-navy/35" />
      <span className="rounded-[2.5px] bg-navy" />
    </span>
  );
}

export function Logo({
  dark = false,
  compact = false,
  className,
}: {
  dark?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-[16px] font-extrabold tracking-[-0.03em]",
              dark ? "text-white" : "text-ink",
            )}
          >
            GentleHub
          </span>
          <span
            className={cn(
              "mt-1 text-[9.5px] font-semibold uppercase tracking-[0.18em]",
              dark ? "text-white/45" : "text-subtle",
            )}
          >
            Gentle Group
          </span>
        </span>
      )}
    </span>
  );
}
