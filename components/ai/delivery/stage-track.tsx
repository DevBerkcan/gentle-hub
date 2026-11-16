import { cn } from "@/lib/cn";
import { VORGANG_STAGES, stageIndex } from "@/lib/vorgaenge";
import type { VorgangStage } from "@/lib/types";

/** Six dots from requirements to live; done steps filled, current one ringed. */
export function StageTrack({ stage, showLabels = false }: { stage: VorgangStage; showLabels?: boolean }) {
  const current = stageIndex(stage);
  return (
    <ol className={cn("flex items-start", showLabels ? "gap-0" : "gap-1")} aria-label={`Stand: ${VORGANG_STAGES[current].label}`}>
      {VORGANG_STAGES.map((item, index) => {
        const done = index < current || (stage === "live" && index === current);
        const active = index === current && stage !== "live";
        return (
          <li key={item.key} className={cn("flex items-center", showLabels && "flex-1 flex-col gap-1 text-center")}>
            <span className={cn("flex w-full items-center", showLabels && "justify-center")}>
              <span
                className={cn(
                  "h-2.5 w-2.5 shrink-0 rounded-full border",
                  done && "border-emerald-500 bg-emerald-500",
                  active && "border-accent bg-accent/20 ring-2 ring-accent/30",
                  !done && !active && "border-line-strong bg-surface",
                )}
                title={`${item.label} (${item.who})`}
              />
            </span>
            {showLabels && (
              <span className={cn("text-[10px] leading-tight", index <= current ? "font-semibold text-ink" : "text-subtle")}>
                {item.label}
                <span className="block font-normal text-subtle">{item.who}</span>
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
