"use client";

import type { ApplicationCategory } from "@/types";
import type { CategoryFilterValue } from "@/lib/search";
import { CATEGORY_LABELS } from "@/data/applications";
import { cn } from "@/lib/utils";

type CategoryFilterProps = {
  categories: ApplicationCategory[];
  counts: Record<CategoryFilterValue, number>;
  active: CategoryFilterValue;
  onChange: (category: CategoryFilterValue) => void;
};

export function CategoryFilter({ categories, counts, active, onChange }: CategoryFilterProps) {
  const options: CategoryFilterValue[] = ["all", ...categories];

  return (
    <div
      role="group"
      aria-label="Nach Kategorie filtern"
      className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0"
    >
      {options.map((option) => {
        const isActive = option === active;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option)}
            className={cn(
              "focus-ring flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors duration-[var(--duration-fast)]",
              isActive
                ? "border-fg bg-fg text-bg"
                : "border-line bg-surface text-fg-muted hover:border-line-strong hover:text-fg"
            )}
          >
            {option === "all" ? "Alle" : CATEGORY_LABELS[option]}
            <span className={cn("tabular-nums", isActive ? "opacity-70" : "text-fg-subtle")}>
              {counts[option] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
