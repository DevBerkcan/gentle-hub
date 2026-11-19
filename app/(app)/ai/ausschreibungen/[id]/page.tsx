import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api";
import { getTenderData } from "@/lib/data";
import { formatEur } from "@/lib/ai-format";
import { formatDate, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import { TENDER_SOURCE, TENDER_STATUS, fitClass } from "@/lib/tenders";
import { PageHeader } from "@/components/ui/page-header";
import { CopyButton } from "@/components/ui/copy-button";
import { RequirementList } from "@/components/ai/requirements-view";
import { TenderActions } from "@/components/ai/tenders/tender-actions";
import { IconChevronLeft, IconExternal } from "@/components/ui/icons";
import { agentName, agentGenitive } from "@/lib/agent-personas";

export const metadata: Metadata = { title: "Ausschreibung" };

export default async function TenderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let detail;
  try {
    detail = await getTenderData(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const { tender, analysis, description } = detail;
  const status = TENDER_STATUS[tender.status];
  const letter = analysis?.draft?.coverLetter;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/ai/ausschreibungen" className="inline-flex w-fit items-center gap-1 text-[11.5px] font-semibold text-muted hover:text-ink">
        <IconChevronLeft className="h-3.5 w-3.5" /> Alle Ausschreibungen
      </Link>
      <PageHeader
        eyebrow={`${TENDER_SOURCE[tender.source] ?? tender.source}${tender.buyer ? ` · ${tender.buyer}` : ""}`}
        title={tender.title}
        action={<span className={cn("rounded-[6px] px-2 py-1 text-[11px] font-semibold", status.className)}>{status.label}</span>}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-5">
          <section className="card flex flex-col gap-3 p-4" aria-labelledby="nora-heading">
            <div className="flex items-center gap-3">
              <span className={cn("rounded-[6px] px-2 py-1 text-[16px] font-semibold tabular-nums", fitClass(tender.fit))}>{tender.fit ?? "…"}</span>
              <div>
                <h2 id="nora-heading" className="text-[13px] font-semibold text-ink">
                  {agentGenitive("tender-scout")} Einschätzung
                </h2>
                <p className="text-[11.5px] text-muted">
                  {tender.status === "scoring" || tender.status === "new"
                    ? `${agentName("tender-scout")} prüft die Ausschreibung gerade.`
                    : tender.status === "failed"
                      ? tender.lastError ?? "Bewertung fehlgeschlagen."
                      : tender.recommendation === "bid"
                        ? "Empfehlung: bewerben"
                        : "Empfehlung: eher lassen"}
                </p>
              </div>
            </div>
            {analysis?.summary && <p className="text-[12px] leading-relaxed text-ink">{analysis.summary}</p>}
            <div className="grid gap-3 sm:grid-cols-2">
              <RequirementList title="Warum" items={analysis?.reasons} />
              <RequirementList title="Risiken" items={analysis?.risks} />
              <RequirementList title="Geforderte Nachweise" items={analysis?.requirements} />
              <RequirementList title="Fragen an die Vergabestelle" items={analysis?.questions} />
            </div>
          </section>

          {letter && (
            <section className="card flex flex-col gap-3 p-4" aria-labelledby="draft-heading">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 id="draft-heading" className="text-[13px] font-semibold text-ink">
                  Entwurf: {analysis?.draft?.subject ?? "Anschreiben"}
                </h2>
                <CopyButton value={letter} label="Anschreiben kopieren" showLabel />
              </div>
              <p className="whitespace-pre-line rounded-lg border border-line bg-surface-2/40 p-3 text-[12px] leading-relaxed text-ink">{letter}</p>
              <RequirementList title="Lösungsansatz" items={analysis?.draft?.approach} />
              <p className="text-[10.5px] text-subtle">Entwurf zum Überarbeiten. Eingereicht wird nur von dir über das Portal der Vergabestelle.</p>
            </section>
          )}

          {description && (
            <details className="card p-4">
              <summary className="cursor-pointer list-none text-[12.5px] font-semibold text-ink">Ausschreibungstext</summary>
              <p className="mt-3 whitespace-pre-line text-[11.5px] leading-relaxed text-muted">{description}</p>
            </details>
          )}
        </div>

        <aside className="flex flex-col gap-4">
          <section className="card flex flex-col gap-2 p-4 text-[11.5px]">
            <dl className="flex flex-col gap-1.5">
              {tender.deadlineAt && (
                <div>
                  <dt className="text-subtle">Frist</dt>
                  <dd className="font-semibold text-ink">{formatDate(tender.deadlineAt)}</dd>
                </div>
              )}
              {tender.valueEur != null && (
                <div>
                  <dt className="text-subtle">Geschätzter Wert</dt>
                  <dd className="font-semibold text-ink">{formatEur(tender.valueEur)} netto</dd>
                </div>
              )}
              {tender.region && (
                <div>
                  <dt className="text-subtle">Region</dt>
                  <dd className="text-ink">{tender.region}</dd>
                </div>
              )}
              {tender.cpv && (
                <div>
                  <dt className="text-subtle">CPV</dt>
                  <dd className="text-ink">{tender.cpv}</dd>
                </div>
              )}
              <div>
                <dt className="text-subtle">Erfasst</dt>
                <dd className="text-ink">{formatDateTime(tender.createdAt)}</dd>
              </div>
              {tender.outcomeReason && (
                <div>
                  <dt className="text-subtle">Begründung</dt>
                  <dd className="text-ink">{tender.outcomeReason}</dd>
                </div>
              )}
            </dl>
            {tender.url && (
              <a href={tender.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex w-fit items-center gap-1 font-semibold text-accent hover:underline">
                Zur Ausschreibung <IconExternal className="h-3 w-3" />
              </a>
            )}
          </section>

          <section className="card flex flex-col gap-2 p-4" aria-labelledby="decision-heading">
            <h2 id="decision-heading" className="text-[12.5px] font-semibold text-ink">
              Entscheidung und Ergebnis
            </h2>
            <TenderActions tender={tender} />
          </section>
        </aside>
      </div>
    </div>
  );
}
