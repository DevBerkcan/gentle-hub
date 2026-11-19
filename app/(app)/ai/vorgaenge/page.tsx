import type { Metadata } from "next";
import Link from "next/link";
import { getVorgaengeData } from "@/lib/data";
import { formatEur } from "@/lib/ai-format";
import { formatRelative } from "@/lib/format";
import { VORGANG_STAGES, stageIndex } from "@/lib/vorgaenge";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StageTrack } from "@/components/ai/delivery/stage-track";
import { GoLiveForm, GoLiveResult } from "@/components/ai/delivery/golive-form";
import { ManualVorgangForm } from "@/components/ai/delivery/manual-vorgang-form";
import { IconActivity, IconChevronRight } from "@/components/ui/icons";
import { agentName } from "@/lib/agent-personas";

export const metadata: Metadata = { title: "Vorgänge" };

export default async function VorgaengePage() {
  const { items, checks } = await getVorgaengeData();
  const counts = VORGANG_STAGES.map((stage) => ({ ...stage, count: items.filter((item) => item.stage === stage.key).length }));
  const lastFree = checks.find((check) => !check.workflowId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="AI Operations"
        title="Vorgänge"
        description={`Jede Kundenanfrage auf einem Weg: ${agentName("project-notes")} schreibt die Anforderungen, ${agentName("estimation")} schätzt, ${agentName("offer-contract")} legt Angebot und Vertrag in GentleSuite an, ${agentName("frontend-plan")}, ${agentName("backend-plan")} und ${agentName("deployment")} planen den Bau, ${agentName("deployment")} prüft vor dem Go-Live und ${agentName("billing")} verfolgt alles bis zur Rechnung.`}
      />

      <details className="card group p-4">
        <summary className="cursor-pointer list-none text-[13px] font-semibold text-ink">
          + Vorgang ohne E-Mail anlegen
          <span className="ml-2 text-[11.5px] font-normal text-muted">Kundin aus Instagram, Telefon oder Messe</span>
        </summary>
        <div className="mt-4">
          <ManualVorgangForm />
        </div>
      </details>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {counts.map((stage) => (
          <div key={stage.key} className="card px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-subtle">{stage.label}</p>
            <p className="text-[18px] font-semibold tabular-nums text-ink">{stage.count}</p>
          </div>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<IconActivity className="h-4 w-4" />}
          title="Noch keine Vorgänge"
          description={`Sobald eine Kundenanfrage per E-Mail kommt und ${agentName("project-notes")} die Anforderungen geschrieben hat, erscheint sie hier.`}
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={`/ai/vorgaenge/${item.id}`} className="card group flex flex-col gap-2 p-3 transition hover:border-line-strong sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-semibold text-ink">{item.title ?? "Anfrage"}</p>
                  <p className="text-[11px] text-muted">
                    {item.source === "manual" && <span className="mr-1 rounded bg-surface-2 px-1 text-[10px] font-semibold">ohne E-Mail</span>}
                    {item.customerName ?? "Kunde unbekannt"} · {formatRelative(item.createdAt)}
                    {item.estimateTotal != null && <> · {formatEur(item.estimateTotal)} netto</>}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end gap-1">
                    <StageTrack stage={item.stage} />
                    <span className="text-[10.5px] font-medium text-muted">{VORGANG_STAGES[stageIndex(item.stage)].label}</span>
                  </div>
                  <IconChevronRight className="h-4 w-4 shrink-0 text-subtle transition group-hover:text-ink" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <section className="card flex flex-col gap-3 p-4" aria-labelledby="golive-heading">
        <div>
          <h2 id="golive-heading" className="text-[13px] font-semibold text-ink">
            Go-Live-Check
          </h2>
          <p className="text-[11.5px] text-muted">
            {agentName("deployment")} prüft eine beliebige Website: HTTPS, Zertifikat, Impressum, Datenschutz, Tracking ohne Einwilligung, noindex, Meta-Daten, Smartphone-Tauglichkeit, 404-Seite und Antwortzeit. Gemessen, nicht geraten.
          </p>
        </div>
        <GoLiveForm />
        {lastFree && (
          <details>
            <summary className="cursor-pointer text-[11px] font-semibold text-muted">Letzter Check: {lastFree.url}</summary>
            <div className="mt-2">
              <GoLiveResult check={lastFree} />
            </div>
          </details>
        )}
      </section>
    </div>
  );
}
