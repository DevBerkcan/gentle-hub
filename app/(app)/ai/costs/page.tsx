import type { Metadata } from "next";
import Link from "next/link";
import { getAiAgentsData, getAiCostsData } from "@/lib/data";
import { formatEur, formatTokens } from "@/lib/ai-format";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { BudgetMeter } from "@/components/ai/budget-meter";
import { IconChevronLeft, IconChevronRight } from "@/components/ui/icons";

export const metadata: Metadata = { title: "KI-Kosten" };

function shiftMonth(month: string, delta: number): string {
  const [year, monthIndex] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthIndex - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default async function AiCostsPage({ searchParams }: { searchParams: Promise<{ month?: string | string[] }> }) {
  const params = await searchParams;
  const rawMonth = Array.isArray(params.month) ? params.month[0] : params.month;
  const month = rawMonth && /^\d{4}-\d{2}$/.test(rawMonth) ? rawMonth : undefined;

  const [report, agents] = await Promise.all([getAiCostsData(month), getAiAgentsData()]);
  const names = new Map(agents.map((agent) => [agent.id, agent.name]));
  const currentMonth = report.budget.month;
  const maxDaily = Math.max(0.0001, ...report.daily.map((day) => day.amountEur));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="AI Operations"
        title="KI-Kosten"
        description="Kosten je Agent und Modell. Reservierungen für laufende Aufrufe und nachträgliche Korrekturen der Anbieter sind enthalten."
        action={
          <nav className="flex items-center gap-1" aria-label="Monat wählen">
            <Link href={`/ai/costs?month=${shiftMonth(currentMonth, -1)}`} className="btn btn-ghost btn-icon" aria-label="Vorheriger Monat">
              <IconChevronLeft className="h-4 w-4" />
            </Link>
            <span className="min-w-20 text-center text-[12.5px] font-semibold tabular-nums text-ink">{currentMonth}</span>
            <Link href={`/ai/costs?month=${shiftMonth(currentMonth, 1)}`} className="btn btn-ghost btn-icon" aria-label="Nächster Monat">
              <IconChevronRight className="h-4 w-4" />
            </Link>
          </nav>
        }
      />

      <BudgetMeter budget={report.budget} />

      <section className="card overflow-x-auto" aria-labelledby="cost-agents-heading">
        <h2 id="cost-agents-heading" className="px-4 pt-4 text-[13px] font-semibold text-ink">
          Je Agent
        </h2>
        <table className="mt-2 w-full min-w-[640px] text-left text-[12px]">
          <thead className="text-[10px] font-semibold uppercase tracking-wide text-subtle">
            <tr className="border-b border-line">
              <th className="px-4 py-2">Agent</th>
              <th className="px-4 py-2">Modell</th>
              <th className="px-4 py-2 text-right">Tokens Ein/Aus</th>
              <th className="px-4 py-2 text-right">Tatsächlich</th>
              <th className="px-4 py-2 text-right">Reserviert</th>
              <th className="px-4 py-2 text-right">Korrektur</th>
              <th className="px-4 py-2 text-right">Gesamt / Budget</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {report.agents.map((row) => (
              <tr key={row.agentId}>
                <td className="px-4 py-2.5 font-medium text-ink">{names.get(row.agentId) ?? row.agentId}</td>
                <td className="px-4 py-2.5 font-mono text-[11px] text-muted">{row.model}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-muted">
                  {formatTokens(row.inputTokens)} / {formatTokens(row.outputTokens)}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">{formatEur(row.actualEur)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-muted">{formatEur(row.reservedEur)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-muted">{formatEur(row.adjustmentEur)}</td>
                <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-ink">
                  {formatEur(row.totalEur)}
                  <span className="font-normal text-muted">
                    {" "}
                    / {row.monthlyBudgetEur == null ? "–" : formatEur(row.monthlyBudgetEur)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card p-4" aria-labelledby="cost-daily-heading">
        <h2 id="cost-daily-heading" className="text-[13px] font-semibold text-ink">
          Verlauf pro Tag
        </h2>
        {report.daily.length === 0 ? (
          <p className="mt-2 text-[12px] text-muted">In diesem Monat sind noch keine Kosten angefallen.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-1.5">
            {report.daily.map((day) => (
              <li key={day.day} className="grid grid-cols-[88px_minmax(0,1fr)_96px] items-center gap-3 text-[11.5px]">
                <span className="text-muted">{formatDate(day.day)}</span>
                <span className="h-2 overflow-hidden rounded-full bg-surface-2">
                  <span
                    className="block h-full rounded-full bg-accent"
                    style={{ width: `${Math.max(2, (day.amountEur / maxDaily) * 100)}%` }}
                  />
                </span>
                <span className="text-right tabular-nums text-ink">{formatEur(day.amountEur)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
