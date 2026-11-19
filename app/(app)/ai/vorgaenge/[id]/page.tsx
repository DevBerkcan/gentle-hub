import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api";
import { getVorgangData } from "@/lib/data";
import { formatEur } from "@/lib/ai-format";
import { formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { RequirementsView } from "@/components/ai/requirements-view";
import { StageTrack } from "@/components/ai/delivery/stage-track";
import { BriefPanel } from "@/components/ai/delivery/brief-panel";
import { SuitePanel } from "@/components/ai/delivery/suite-panel";
import { SitePanel } from "@/components/ai/delivery/site-panel";
import { GoLiveForm, GoLiveResult } from "@/components/ai/delivery/golive-form";
import { IconChevronLeft, IconMail } from "@/components/ui/icons";
import { agentName, agentGenitive } from "@/lib/agent-personas";

export const metadata: Metadata = { title: "Vorgang" };

const ESTIMATE_STATUS: Record<string, string> = {
  pending_approval: "wartet auf Freigabe",
  approved: "freigegeben",
  rejected: "abgelehnt",
  superseded: "ersetzt",
};

export default async function VorgangPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let detail;
  try {
    detail = await getVorgangData(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const { vorgang, requirements, estimate, briefs, goLiveChecks, suite, site } = detail;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/ai/vorgaenge" className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-muted hover:text-ink">
        <IconChevronLeft className="h-3.5 w-3.5" /> Alle Vorgänge
      </Link>
      <PageHeader
        eyebrow={vorgang.customerName ?? "Vorgang"}
        title={vorgang.title ?? "Anfrage"}
        description={`Eingegangen ${formatDateTime(vorgang.createdAt)}.`}
      />

      <div className="card p-4">
        <StageTrack stage={vorgang.stage} showLabels />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-3" aria-labelledby="site-heading">
            <div>
              <h2 id="site-heading" className="text-[13px] font-semibold text-ink">
                Website ({agentName("site-builder")} und {agentName("deployment")})
              </h2>
              <p className="text-[11.5px] text-muted">
                Aus dem Gentle-Baukasten: {agentName("site-builder")} übernimmt ein vorhandenes Branding oder entwirft eins, schreibt alle Texte und erfindet keine Fakten. {agentName("deployment")} stellt die Seite als Vorschau-Link online (nicht in Google, Impressum und Datenschutz als Platzhalter). Auf die Domain der Kundin kommt sie erst nach deiner Freigabe.
              </p>
            </div>
            <SitePanel vorgangId={vorgang.id} site={site} />
          </section>

          <section className="flex flex-col gap-3" aria-labelledby="suite-heading">
            <div>
              <h2 id="suite-heading" className="text-[13px] font-semibold text-ink">
                Angebot, Vertrag, Rechnung (GentleSuite)
              </h2>
              <p className="text-[11.5px] text-muted">
                {agentName("offer-contract")} übernimmt {agentGenitive("estimation")} freigegebene Schätzung 1:1 als Angebot und legt den Vertragsentwurf an. Jeder Schritt schreibt in GentleSuite und läuft nur nach deiner Bestätigung. {agentName("billing")} verfolgt das Angebot bis zur Rechnung; die entsteht in GentleSuite über „Überführen“.
              </p>
            </div>
            <SuitePanel vorgangId={vorgang.id} suite={suite} estimateApproved={estimate?.status === "approved"} />
          </section>

          <section className="flex flex-col gap-3" aria-labelledby="brief-heading">
            <div>
              <h2 id="brief-heading" className="text-[13px] font-semibold text-ink">
                Bauauftrag
              </h2>
              <p className="text-[11.5px] text-muted">
                {agentName("frontend-plan")}, {agentName("backend-plan")} und {agentName("deployment")} planen aus Anforderungen und Schätzung. Sie schreiben keinen Code und deployen nichts. Den Prompt kopierst du in Claude Code, Zugangsdaten trägst du selbst ein.
              </p>
            </div>
            {requirements ? (
              <BriefPanel vorgangId={vorgang.id} briefs={briefs} />
            ) : (
              <p className="text-[11.5px] text-muted">Erst wenn {agentName("project-notes")} die Anforderungen geschrieben hat, kann geplant werden.</p>
            )}
          </section>

          <section className="card flex flex-col gap-3 p-4" aria-labelledby="golive-heading">
            <h2 id="golive-heading" className="text-[13px] font-semibold text-ink">
              Go-Live-Check
            </h2>
            <GoLiveForm workflowId={vorgang.id} defaultUrl={goLiveChecks[0]?.url} />
            {goLiveChecks[0] && <GoLiveResult check={goLiveChecks[0]} />}
          </section>
        </div>

        <aside className="flex flex-col gap-4">
          {estimate && (
            <section className="card flex flex-col gap-2 p-4" aria-labelledby="estimate-heading">
              <h2 id="estimate-heading" className="text-[12.5px] font-semibold text-ink">
                Schätzung ({agentName("estimation")})
              </h2>
              <p className="text-[18px] font-semibold tabular-nums text-ink">
                {formatEur(estimate.totals.totalNetEur)} <span className="text-[11px] font-medium text-muted">netto</span>
              </p>
              <p className="text-[11px] text-muted">{ESTIMATE_STATUS[estimate.status] ?? estimate.status}</p>
              <ul className="flex flex-col gap-0.5 text-[11.5px]">
                {estimate.items.map((item, index) => (
                  <li key={index} className="flex justify-between gap-2">
                    <span className="truncate text-ink">{item.title}</span>
                    <span className="tabular-nums text-muted">{formatEur(item.amountEur)}</span>
                  </li>
                ))}
              </ul>
              {estimate.approvalId && (
                <Link href={`/ai/approvals/${estimate.approvalId}`} className="text-[11.5px] font-semibold text-accent hover:underline">
                  Zur Freigabe
                </Link>
              )}
            </section>
          )}

          {vorgang.emailMessageId && (
            <Link href={`/ai/emails/${vorgang.emailMessageId}`} className="card inline-flex items-center gap-2 p-3 text-[11.5px] font-semibold text-accent hover:underline">
              <IconMail className="h-3.5 w-3.5" /> Ursprüngliche E-Mail
            </Link>
          )}

          {requirements && (
            <section className="card flex flex-col gap-3 p-4" aria-labelledby="req-heading">
              <h2 id="req-heading" className="text-[12.5px] font-semibold text-ink">
                Anforderungen ({agentName("project-notes")})
              </h2>
              <RequirementsView content={requirements} compact />
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
