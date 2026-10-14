import type { Application } from "@/types";
import { isValidIconSource } from "@/data/applications";
import { cn, toMonogram } from "@/lib/utils";

/** Deterministically alternates between the two brand tints so monograms are distinguishable. */
function tintFor(id: string): "accent" | "accent-2" {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return hash % 2 === 0 ? "accent" : "accent-2";
}

type AppIconProps = {
  application: Pick<Application, "id" | "name" | "icon">;
  size?: "sm" | "md";
  className?: string;
};

export function AppIcon({ application, size = "md", className }: AppIconProps) {
  const { id, name, icon } = application;
  const sizeClasses = size === "sm" ? "h-8 w-8 rounded-lg text-[11px]" : "h-10 w-10 rounded-[10px] text-xs";

  if (icon && isValidIconSource(icon)) {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden border border-line bg-surface",
          sizeClasses,
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- app logos may be external URLs */}
        <img src={icon} alt="" className="h-full w-full object-contain p-1.5" loading="lazy" />
      </span>
    );
  }

  const tint = tintFor(id);
  return (
    <span
      aria-hidden="true"
      data-testid="app-monogram"
      className={cn(
        "flex shrink-0 items-center justify-center font-semibold tracking-tight",
        tint === "accent"
          ? "bg-accent/15 text-accent-fg ring-1 ring-inset ring-accent/25"
          : "bg-accent-2/15 text-accent-2-fg ring-1 ring-inset ring-accent-2/25",
        sizeClasses,
        className
      )}
    >
      {toMonogram(name)}
    </span>
  );
}
