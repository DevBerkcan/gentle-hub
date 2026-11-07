"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateReplyAction } from "@/app/actions";
import { formatDateTime } from "@/lib/format";
import type { DraftReview, ReplyDraft } from "@/lib/types";
import { FormError, SuccessNote } from "@/components/ui/field";
import { ApprovalDecision } from "@/components/ai/approval-actions";
import { DraftReviewBox } from "@/components/ai/draft-review-box";
import { IconCheck, IconLoader, IconMail } from "@/components/ui/icons";

const STATUS_TEXT: Record<ReplyDraft["status"], string> = {
  pending_approval: "Wartet auf deine Freigabe",
  sent: "Gesendet",
  rejected: "Verworfen",
  superseded: "Durch neueren Entwurf ersetzt",
  failed: "Senden fehlgeschlagen",
};

/**
 * Review screen for a reply draft: recipient is fixed (original sender), subject and
 * text can be edited. Sending applies to the saved version only, so it is blocked
 * while there are unsaved edits.
 */
export function ReplyReview({
  reply,
  approvalId,
  version,
  contentHash,
  isOpen,
  review,
}: {
  review?: DraftReview | null;
  reply: ReplyDraft;
  approvalId: string;
  version: number;
  contentHash: string;
  isOpen: boolean;
}) {
  const router = useRouter();
  const [subject, setSubject] = useState(reply.subject);
  const [body, setBody] = useState(reply.bodyText);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const editable = isOpen && reply.status === "pending_approval";
  const dirty = subject !== reply.subject || body !== reply.bodyText;
  const recipient = reply.toName ? `${reply.toName} <${reply.toAddress}>` : reply.toAddress;

  function save() {
    setError(null);
    setMessage(null);
    if (!subject.trim() || body.trim().length < 10) {
      setError("Betreff und ein Text mit mindestens 10 Zeichen sind nötig.");
      return;
    }

    startTransition(async () => {
      const result = await updateReplyAction(reply.id, { expectedApprovalVersion: version, subject, body });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage(`Gespeichert. Gesendet wird jetzt Version ${result.approvalVersion}.`);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {editable && <DraftReviewBox review={review} version={version} />}

      {editable && (
        <ApprovalDecision
          approvalId={approvalId}
          version={version}
          contentHash={contentHash}
          approveLabel={`Jetzt senden (Version ${version})`}
          hint={`Wird an ${reply.toAddress} über ${reply.fromAddress} gesendet und im Gesendet-Ordner abgelegt. Nichts geht ohne diesen Klick raus.`}
          disabledReason={dirty ? "Du hast ungespeicherte Änderungen. Bitte erst speichern, dann senden." : null}
        />
      )}

      <section className="card flex flex-col gap-4 p-5" aria-labelledby="reply-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="reply-heading" className="flex items-center gap-2 text-[14px] font-semibold text-ink">
            <IconMail className="h-4 w-4 text-accent" />
            {reply.purpose === "offer" ? "Angebotsmail" : reply.purpose === "followup" ? "Nachfass-Mail" : reply.purpose === "report" ? "Monatsbericht" : "Antwort an den Kunden"}
          </h2>
          {editable && (
            <button type="button" onClick={save} disabled={pending || !dirty} className="btn btn-secondary h-8 text-[11.5px]">
              {pending ? <IconLoader className="h-3.5 w-3.5" /> : <IconCheck className="h-3.5 w-3.5" />}
              Änderungen speichern
            </button>
          )}
        </div>
        <FormError message={error} />
        <SuccessNote message={message} />

        {!editable && (
          <p className="rounded-[8px] bg-surface-2 px-3 py-2 text-[12px] text-ink">
            <strong>{STATUS_TEXT[reply.status]}</strong>
            {reply.sentAt && ` am ${formatDateTime(reply.sentAt)}`}
            {reply.status === "sent" && !reply.savedToSent && " (Kopie im Gesendet-Ordner nicht abgelegt)"}
            {reply.lastError && <span className="block text-[11px] text-muted">{reply.lastError}</span>}
          </p>
        )}
        {editable && reply.lastError && (
          <p className="rounded-[8px] bg-amber-50 px-3 py-2 text-[11.5px] text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
            Letzter Versuch: {reply.lastError}
          </p>
        )}

        <dl className="grid gap-2 text-[12px] sm:grid-cols-[90px_minmax(0,1fr)]">
          <dt className="text-subtle">An</dt>
          <dd className="font-medium text-ink">{recipient}</dd>
          <dt className="text-subtle">Von</dt>
          <dd className="text-ink">{reply.fromAddress}</dd>
        </dl>

        <label className="flex flex-col gap-1">
          <span className="label">Betreff</span>
          <input className="input" value={subject} disabled={!editable} maxLength={300} onChange={(event) => setSubject(event.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="label">Text</span>
          {editable ? (
            <textarea
              className="textarea min-h-[340px] font-[inherit] text-[13px] leading-relaxed"
              value={body}
              maxLength={20_000}
              onChange={(event) => setBody(event.target.value)}
            />
          ) : (
            <p className="whitespace-pre-wrap rounded-[10px] border border-line bg-surface p-4 text-[13px] leading-relaxed text-ink">{body}</p>
          )}
        </label>
      </section>
    </div>
  );
}
