import type { ApplicationEnvironment } from "@/types";
import { cn } from "@/lib/utils";

const LABELS: Record<Exclude<ApplicationEnvironment, "production">, string> = {
  staging: "Staging",
  development: "Development",
};

/** Labels non-production environments. Production is the default and renders nothing. */
export function EnvironmentBadge({ environment }: { environment?: ApplicationEnvironment }) {
  if (!environment || environment === "production") return null;

  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-md px-1.5 text-[11px] font-medium",
        environment === "staging"
          ? "bg-accent-2/15 text-accent-2-fg"
          : "bg-surface-muted text-fg-muted"
      )}
    >
      {LABELS[environment]}
    </span>
  );
}
