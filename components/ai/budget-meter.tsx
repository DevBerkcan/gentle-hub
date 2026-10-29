import { cn } from "@/lib/cn";
import { formatEur } from "@/lib/ai-format";
import type { BudgetStatus } from "@/lib/types";

export function BudgetMeter({ budget, className }: { budget: BudgetStatus; className?: string }) {
  const used = budget.spentEur + budget.reservedEur;
  const percent = budget.budgetEur > 0 ? Math.min(100, (used / budget.budgetEur) * 100) : used > 0 ? 100 : 0;
  const tone = budget.isExhausted ? "bg-rose-500" : percent >= 80 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className={cn("card p-4 sm:p-5", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[12.5px] font-semibold text-ink">Monatsbudget {budget.month}</h2>
        <p className="text-[11px] text-muted">
          <span className="font-semibold tabular-nums text-ink">{formatEur(used)}</span> von{" "}
          <span className="tabular-nums">{formatEur(budget.budgetEur)}</span>
        </p>
      </div>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        aria-label="Verbrauch des Monatsbudgets"
      >
        <div className={cn("h-full rounded-full transition-all", tone)} style={{ width: `${percent}%` }} />
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
        <div>
          <dt className="text-subtle">Verbraucht</dt>
          <dd className="font-semibold tabular-nums text-ink">{formatEur(budget.spentEur)}</dd>
        </div>
        <div>
          <dt className="text-subtle">Reserviert</dt>
          <dd className="font-semibold tabular-nums text-ink">{formatEur(budget.reservedEur)}</dd>
        </div>
        <div>
          <dt className="text-subtle">Verfügbar</dt>
          <dd className="font-semibold tabular-nums text-ink">{formatEur(budget.remainingEur)}</dd>
        </div>
      </dl>
      {budget.isExhausted && (
        <p className="mt-3 rounded-[8px] border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-800">
          Budget ausgeschöpft: Es werden keine neuen KI-Aufträge gestartet.
        </p>
      )}
    </div>
  );
}
