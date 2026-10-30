import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api";
import { getCrmStatusData, getEmailCrmLinkData, getEmailData } from "@/lib/data";
import { REQUEST_TYPE_LABELS } from "@/lib/ai-format";
import { formatDate, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { EmailIntelligenceResult } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { EmailList, ImportanceBadge } from "@/components/ai/email-list";
import { ReanalyzeButton } from "@/components/ai/mailbox-actions";
import { CrmLinkCard } from "@/components/ai/crm-link-card";
import { IconAlert, IconChevronLeft } from "@/components/ui/icons";

type PageParams = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "E-Mail" };

function parse(json?: string | null): EmailIntelligenceResult {
  if (!json) return {};
  try {
    return JSON.parse(json) as EmailIntelligenceResult;
  } catch {
    return {};
  }
}

export default async function AiEmailPage({ params }: PageParams) {
  const { id } = await params;
  let email;
  try {
    email = await getEmailData(id);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }

  const [crmLink, crmStatus] = await Promise.all([getEmailCrmLinkData(id), getCrmStatusData()]);
  const analysis = email.analysis;
  const result = parse(analysis?.resultJson);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/ai/emails" className="inline-flex w-fit items-center gap-1 text-[11.5px] font-semibold text-muted hover:text-ink">
        <IconChevronLeft className="h-3.5 w-3.5" />
        Alle E-Mails
      </Link>
      <PageHeader
        eyebrow={`${email.connectionLabel} · ${formatDateTime(email.receivedAt)}`}
        title={email.subject || "(ohne Betreff)"}
        description={`Von ${email.fromName ? `${email.fromName} <${email.fromAddress}>` : email.fromAddress ?? "unbekannt"}`}
        action={<ReanalyzeButton id={email.id} />}
      />

      {analysis?.injectionSuspected && (
        <p className="flex items-start gap-2 rounded-[10px] border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] text-rose-800">
          <IconAlert className="mt-0.5 h-4 w-4 shrink-0" />
          Diese E-Mail enthält Formulierungen, die Anweisungen an eine KI einschleusen wollen. Die Inhalte wurden nur als
          Daten behandelt; prüfe die Nachricht besonders sorgfältig.
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-6">
          {analysis ? (
            <section className="card flex flex-col gap-4 p-5" aria-labelledby="analysis-heading">
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="analysis-heading" className="mr-auto text-[13.5px] font-semibold text-ink">
                  Analyse des E-Mail-Agenten
                </h2>
                <ImportanceBadge importance={analysis.importance} />
                <span className="rounded-[5px] bg-surface-2 px-1.5 py-0.5 text-[9.5px] font-semibold text-ink-2">
                  {REQUEST_TYPE_LABELS[analysis.requestType] ?? analysis.requestType}
                </span>
                {analysis.isCustomerRequest && (
                  <span className="rounded-[5px] bg-accent-soft px-1.5 py-0.5 text-[9.5px] font-semibold text-accent">Kundenanfrage</span>
                )}
              </div>
              <p className="text-[13px] leading-relaxed text-ink">{analysis.summary}</p>
              <ListBlock title="Anforderungen" items={result.requirements} />
              <ListBlock title="Offene Fragen" items={result.openQuestions} />
              <ListBlock
                title="Fristen"
                items={result.deadlines?.map((deadline) =>
                  [deadline.description, deadline.date ? formatDate(deadline.date) : null].filter(Boolean).join(" – "),
                )}
              />
              <ListBlock title="Empfohlene Maßnahmen" items={result.recommendedActions} />
              {result.projectHint && (
                <p className="text-[12px] text-muted">
                  Projektbezug: <span className="font-medium text-ink">{result.projectHint}</span>
                </p>
              )}
              <p className="border-t border-line pt-3 text-[10.5px] text-subtle">
                Analysiert {formatDateTime(analysis.createdAt)}
                {analysis.workflowId && (
                  <>
                    {" · "}
                    <Link href="/ai/history" className="hover:underline">
                      Workflow
                    </Link>
                  </>
                )}
              </p>
            </section>
          ) : (
            <section className="card p-5 text-[12.5px] text-muted">
              {email.status === "queued"
                ? "Die Analyse ist eingeplant und läuft beim nächsten Job-Durchlauf."
                : email.status === "skipped"
                  ? "Diese Nachricht ging an mehrere verbundene Postfächer und wurde bereits dort analysiert."
                  : email.status === "failed"
                    ? "Die Analyse ist fehlgeschlagen. Details stehen in der Workflow-Historie."
                    : "Für dieses Postfach ist die KI-Analyse ausgeschaltet."}
            </section>
          )}

          {email.thread.length > 0 && (
            <section className="flex flex-col gap-3" aria-labelledby="thread-heading">
              <h2 id="thread-heading" className="text-[14px] font-semibold text-ink">
                Konversation ({email.thread.length})
              </h2>
              <EmailList emails={email.thread} />
            </section>
          )}
        </div>

        <aside className="flex flex-col gap-5">
          {analysis?.isCustomerRequest && (
            <CrmLinkCard emailId={email.id} link={crmLink} crmConfigured={crmStatus?.configured ?? false} />
          )}
          <section className="card p-4" aria-labelledby="body-heading">
            <h2 id="body-heading" className="text-[12.5px] font-semibold text-ink">
              Nachricht
            </h2>
            <p className="mt-1 text-[10.5px] text-subtle">
              An: {email.toAddresses || "–"}
              {email.ccAddresses ? ` · Cc: ${email.ccAddresses}` : ""}
              {email.hadHtml ? " · HTML in Text umgewandelt" : ""}
            </p>
            {email.bodyPurged ? (
              <p className="mt-3 text-[12px] text-muted">Der Text wurde nach Ablauf der Aufbewahrungsfrist gelöscht.</p>
            ) : (
              <pre className="mt-3 max-h-[28rem] overflow-auto whitespace-pre-wrap break-words font-sans text-[12px] leading-relaxed text-ink-2">
                {email.bodyText || "(leer)"}
                {email.bodyTruncated && "\n[… gekürzt]"}
              </pre>
            )}
          </section>

          {email.attachments.length > 0 && (
            <section className="card p-4" aria-labelledby="attachments-heading">
              <h2 id="attachments-heading" className="text-[12.5px] font-semibold text-ink">
                Anhänge
              </h2>
              <ul className="mt-2 flex flex-col gap-1.5">
                {email.attachments.map((attachment, index) => (
                  <li key={index} className="flex items-center gap-2 text-[11.5px]">
                    <span
                      className={cn(
                        "rounded-[5px] px-1.5 py-0.5 text-[9.5px] font-semibold",
                        attachment.verdict === "allowed" && "bg-emerald-50 text-emerald-700",
                        attachment.verdict === "blocked" && "bg-slate-100 text-slate-600",
                        attachment.verdict === "dangerous" && "bg-rose-50 text-rose-700",
                      )}
                    >
                      {attachment.verdict === "allowed" ? "geprüft" : attachment.verdict === "dangerous" ? "gefährlich" : "nicht analysiert"}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-ink">{attachment.fileName}</span>
                    <span className="text-subtle">{Math.max(1, Math.round(attachment.sizeBytes / 1024))} KB</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[10.5px] text-subtle">Anhänge werden nur beschrieben, nicht geöffnet oder gespeichert.</p>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items?: (string | null | undefined)[] }) {
  const values = (items ?? []).filter((item): item is string => Boolean(item && item.trim()));
  if (values.length === 0) return null;
  return (
    <div>
      <h3 className="text-[10px] font-semibold uppercase tracking-wide text-subtle">{title}</h3>
      <ul className="mt-1.5 flex list-disc flex-col gap-1 pl-4 text-[12.5px] leading-relaxed text-ink">
        {values.map((value, index) => (
          <li key={index}>{value}</li>
        ))}
      </ul>
    </div>
  );
}
