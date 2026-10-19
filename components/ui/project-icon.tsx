import { cn } from "@/lib/cn";
import { accentOf } from "@/lib/constants";
import { initials } from "@/lib/format";

type ProjectIconProps = {
  name: string;
  icon?: string | null;
  accent?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizes = {
  sm: "h-9 w-9 rounded-[11px] text-[15px]",
  md: "h-11 w-11 rounded-[13px] text-[19px]",
  lg: "h-14 w-14 rounded-[17px] text-[24px]",
  xl: "h-[4.5rem] w-[4.5rem] rounded-[20px] text-[30px]",
};

export function ProjectIcon({ name, icon, accent, size = "md", className }: ProjectIconProps) {
  const tone = accentOf(accent);

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center font-semibold ring-1 ring-inset ring-black/[0.06]",
        tone.tile,
        sizes[size],
        className,
      )}
    >
      {icon ? (
        <span className="leading-none drop-shadow-[0_1px_1px_rgb(0_0_0/0.08)]">{icon}</span>
      ) : (
        <span className="font-display text-[0.72em] font-extrabold tracking-tight">{initials(name)}</span>
      )}
    </span>
  );
}
