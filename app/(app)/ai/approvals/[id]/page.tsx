import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api";
import { getApprovalData, getLeadCheckData } from "@/lib/data";
import { APPROVAL_STATUS, formatEur } from "@/lib/ai-format";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { ProjectNoteContent } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { EstimateEditor } from "@/components/ai/estimate-editor";
import { ApprovalDecision } from "@/components/ai/approval-actions";
import { CounterOfferForm, CounterOfferHistory } from "@/components/ai/counter-offer";
import { ReplyReview } from "@/components/ai/reply-review";
import { LeadCheckCard } from "@/components/ai/lead-check-card";
import { AgentAvatar } from "@/components/ai/agent-avatar";
import { personaLabel } from "@/lib/agent-personas";
import { IconChevronLeft, IconExternal, IconMail } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Freigabe" };

type PageParams = { params: Promise<{ id: string }> };

function parseNote(json?: string | null): ProjectNoteContent {
  if (!json) return {};
  try {
    return JSON.parse(json) as ProjectNoteContent;
  } catch {
    return {};
  }
}

export default async function AiApprovalPage({ params }: PageParams) {
  const { id } = await params;
  let detail;
  try {
    detail = await getApprovalData(id);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }

  const { approval, estimate, note, reply } = detail;
  const leadCheck = estimate?.emailMessageId ? await getLeadCheckData(estimate.emailMessageId) : null;
  const meta = APPROVAL_STATUS[approval.status] ?? APPROVAL_STATUS.pending;
  const isOpen = approval.status === "pending" && new Date(approval.expiresAt) > new Date();
  const canCounter = Boolean(estimate) && (isOpen || estimate?.status === "rejected");
  const noteContent = parseNote(note?.contentJson);
  const offer = estimate?.offerDraftJson ? (JSON.parse(estimate.offerDraftJson) as { subject?: string; lines?: unknown[]; totalNetEur?: number }) : null;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/ai/approvals" className="inline-flex w-fit items-center gap-1 text-[11.5px] font-semibold text-muted hover:text-ink">
        <IconChevronLeft className="h-3.5 w-3.5" />
        Alle Freigaben
      </Link>
      <PageHeader
        eyebrow={`Freigabe · Version ${approval.version}`}
        title={approval.title}
        description={approval.summary ?? undefined}
        action={
          <>
            <span className={cn("rounded-[6px] px-2 py-1 text-[11px] font-semibold", meta.className)}>{meta.label}</span>
            {estimate && (
              <a href={`/ai/estimates/${estimate.id}/docx`} className="btn btn-secondary">
                <IconExternal className="h-3.5 w-3.5" />
                DOCX
              </a>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-6">
          {reply && (
            <ReplyReview
              key={`${reply.id}-${approval.version}`}
              reply={reply}
              approvalId={approval.id}
              version={approval.version}
              contentHash={detail.contentHash}
              isOpen={isOpen}
              review={detail.review}
            />
          )}

          {!reply && isOpen && (
            <ApprovalDecision approvalId={approval.id} version={approval.version} contentHash={detail.contentHash} estimateId={estimate?.id} />
          )}

          {!isOpen && !reply && (
            <section className="card p-4 text-[12.5px]">
              {approval.decidedBy ? (
                <p>
                  {meta.label} von <strong>{approval.decidedBy}</strong> am {formatDateTime(approval.decidedAt)}
                  {detail.decisionNote && <span className="text-muted"> – „{detail.decisionNote}“</span>}
                </p>
              ) : (
                <p className="text-muted">Diese Freigabe ist nicht mehr offen ({meta.label}).</p>
              )}
            </section>
          )}

          {offer && (
            <section className="card flex flex-col gap-2 p-4" aria-labelledby="offer-heading">
              <h2 id="offer-heading" className="text-[13px] font-semibold text-ink">
                Angebotsentwurf vorbereitet
              </h2>
              <p className="text-[12px] text-muted">
                {offer.subject} · {offer.lines?.length ?? 0} Positionen · {formatEur(offer.totalNetEur)} netto
              </p>
              <p className="text-[11px] text-subtle">
                Interner Entwurf. Sobald GentleSuite angebunden ist, wird daraus nach einer weiteren Freigabe ein Angebotsentwurf
                in GentleSuite. Versendet wird nichts automatisch.
              </p>
            </section>
          )}

          {estimate && <EstimateEditor key={`${estimate.id}-${approval.version}`} estimate={estimate} approvalVersion={approval.version} editable={isOpen} />}
        </div>

        <aside className="flex flex-col gap-5">
          {canCounter && estimate && <CounterOfferForm estimateId={estimate.id} agentTotal={estimate.totals.totalNetEur} />}
          <CounterOfferHistory items={detail.counterOffers ?? []} />

          <section className="card p-4">
            <h2 className="text-[12.5px] font-semibold text-ink">Herkunft</h2>
            <dl className="mt-2 flex flex-col gap-2 text-[11.5px]">
              <div>
                <dt className="text-subtle">Kunde</dt>
                <dd className="font-medium text-ink">{estimate?.customerName ?? reply?.toName ?? reply?.toAddress ?? "nicht zugeordnet"}</dd>
              </div>
              <div>
                <dt className="text-subtle">Agent</dt>
                <dd className="flex items-center gap-2 font-medium text-ink">
                  <AgentAvatar agentId={approval.agentId ?? (reply ? "reply-drafter" : "estimation")} size={34} />
                  {personaLabel(approval.agentId ?? (reply ? "reply-drafter" : "estimation"))}
                </dd>
              </div>
              <div>
                <dt className="text-subtle">Erstellt</dt>
                <dd className="font-medium text-ink">{formatDateTime(approval.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-subtle">Gültig bis</dt>
                <dd className="font-medium text-ink">{formatDateTime(approval.expiresAt)}</dd>
              </div>
              {approval.nextAction && (
                <div>
                  <dt className="text-subtle">Nächster Schritt</dt>
                  <dd className="font-medium text-ink">{approval.nextAction}</dd>
                </div>
              )}
            </dl>
            {(estimate?.emailMessageId ?? reply?.emailMessageId) && (
              <Link href={`/ai/emails/${estimate?.emailMessageId ?? reply?.emailMessageId}`} className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-accent hover:underline">
                <IconMail className="h-3.5 w-3.5" />
                {detail.emailSubject ?? "Ursprüngliche E-Mail"}
              </Link>
            )}
            {detail.emailFrom && <p className="mt-1 text-[10.5px] text-muted">{detail.emailFrom}</p>}
          </section>

          {estimate?.emailMessageId && leadCheck && <LeadCheckCard emailId={estimate.emailMessageId} check={leadCheck} />}

          {note && (
            <section className="card flex flex-col gap-3 p-4" aria-labelledby="note-heading">
              <h2 id="note-heading" className="text-[12.5px] font-semibold text-ink">
                Projektnotiz
              </h2>
              {noteContent.projectDescription && <p className="text-[12px] leading-relaxed text-ink">{noteContent.projectDescription}</p>}
              <NoteList title="Fachliche Anforderungen" items={noteContent.businessRequirements} />
              <NoteList title="Technische Anforderungen" items={noteContent.technicalRequirements} />
              <NoteList title="Offene Fragen" items={noteContent.openQuestions} />
              <NoteList title="Risiken" items={noteContent.risks} />
              <NoteList title="Aufgaben" items={noteContent.tasks?.map((task) => task.title ?? "")} />
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

function NoteList({ title, items }: { title: string; items?: (string | undefined)[] }) {
  const values = (items ?? []).filter((item): item is string => Boolean(item?.trim()));
  if (values.length === 0) return null;
  return (
    <div>
      <h3 className="text-[10px] font-semibold uppercase tracking-wide text-subtle">{title}</h3>
      <ul className="mt-1 flex list-disc flex-col gap-0.5 pl-4 text-[11.5px] leading-relaxed text-ink">
        {values.map((value, index) => (
          <li key={index}>{value}</li>
        ))}
      </ul>
    </div>
  );
}
