import type { Metadata } from "next";
import Link from "next/link";
import { getTendersData } from "@/lib/data";
import { formatEur } from "@/lib/ai-format";
import { formatDate, formatRelative } from "@/lib/format";
import { cn } from "@/lib/cn";
import { TENDER_SOURCE, TENDER_STATUS, TENDER_VIEWS, fitClass } from "@/lib/tenders";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { AgentAvatar } from "@/components/ai/agent-avatar";
import { TenderToolbar } from "@/components/ai/tenders/tender-toolbar";
import { TenderSettingsForm } from "@/components/ai/tenders/tender-settings-form";
import { IconChevronRight, IconSearch } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Ausschreibungen" };

type Params = { searchParams: Promise<{ view?: string }> };

export default async function TendersPage({ searchParams }: Params) {
  const requested = (await searchParams).view;
  const view = TENDER_VIEWS.some((item) => item.key === requested) ? requested! : "recommended";
  const { items, stats, settings, mailboxes } = await getTendersData(view);
  const total = (key: "found" | "recommended" | "submitted" | "won" | "lost") => stats.reduce((sum, s) => sum + s[key], 0);
  const decided = total("won") + total("lost");
  const scoring = items.some((item) => item.status === "new" || item.status === "scoring");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4">
        <AgentAvatar agentId="tender-scout" size={88} state={scoring ? "working" : "idle"} title="Nora · Ausschreibungen" className="hidden sm:block" />
        <div className="min-w-0 flex-1">
          <PageHeader
            eyebrow="Vertrieb"
            title="Ausschreibungen"
            description="Nora sucht öffentliche Ausschreibungen (TED), liest die Suchalarme der Portale aus dem Ausschreibungs-Postfach und bewertet jede Ausschreibung für Gentle Group: Passung, Empfehlung, geforderte Nachweise und ein Anschreiben als Entwurf. Einreichen tust du. Dein Ergebnis mit Grund macht ihre Empfehlungen besser."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
        {[
          ["Gefunden", total("found")],
          ["Empfohlen", total("recommended")],
          ["Eingereicht", total("submitted")],
          ["Gewonnen", total("won")],
          ["Verloren", total("lost")],
          ["Gewinnquote", decided > 0 ? `${Math.round((100 * total("won")) / decided)} %` : "–"],
        ].map(([label, value]) => (
          <div key={label} className="card px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-subtle">{label}</p>
            <p className="text-[18px] font-semibold tabular-nums text-ink">{value}</p>
          </div>
        ))}
      </div>

      <TenderToolbar scoring={scoring} />

      <nav aria-label="Ansicht" className="flex flex-wrap gap-1">
        {TENDER_VIEWS.map((item) => (
          <Link
            key={item.key}
            href={`/ai/ausschreibungen?view=${item.key}`}
            aria-current={item.key === view ? "page" : undefined}
            className={cn(
              "rounded-[8px] px-3 py-1.5 text-[11.5px] font-semibold",
              item.key === view ? "bg-ink text-surface" : "text-muted hover:bg-surface-2 hover:text-ink",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {items.length === 0 ? (
        <EmptyState
          icon={<IconSearch className="h-4 w-4" />}
          title="Hier ist gerade nichts"
          description={view === "recommended" ? "Keine offenen Empfehlungen. „Jetzt bei TED suchen“ oder eine Ausschreibung von Hand erfassen." : "Keine Einträge in dieser Ansicht."}
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((tender) => {
            const status = TENDER_STATUS[tender.status];
            return (
              <li key={tender.id}>
                <Link href={`/ai/ausschreibungen/${tender.id}`} className="card group flex items-center gap-3 p-3 transition hover:border-line-strong">
                  <span className={cn("w-12 shrink-0 rounded-[6px] py-1 text-center text-[12px] font-semibold tabular-nums", fitClass(tender.fit))} title="Passung laut Nora">
                    {tender.fit ?? "…"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-semibold text-ink">{tender.title}</p>
                    <p className="flex flex-wrap gap-x-2 text-[11px] text-muted">
                      <span>{tender.buyer ?? "Auftraggeber unbekannt"}</span>
                      {tender.deadlineAt && <span>· Frist {formatDate(tender.deadlineAt)}</span>}
                      {tender.valueEur != null && <span>· {formatEur(tender.valueEur)}</span>}
                      <span>· {TENDER_SOURCE[tender.source] ?? tender.source}</span>
                      <span>· {formatRelative(tender.createdAt)}</span>
                    </p>
                  </div>
                  <span className={cn("shrink-0 rounded-[5px] px-1.5 py-0.5 text-[10px] font-semibold", status.className)}>
                    {tender.status === "scored" && tender.recommendation === "skip" ? "Eher lassen" : status.label}
                  </span>
                  <IconChevronRight className="h-4 w-4 shrink-0 text-subtle transition group-hover:text-ink" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <details className="card p-4">
        <summary className="cursor-pointer list-none text-[12.5px] font-semibold text-ink">Einstellungen: was Nora sucht</summary>
        <div className="mt-4">
          <TenderSettingsForm settings={settings} mailboxes={mailboxes} />
        </div>
      </details>
    </div>
  );
}
