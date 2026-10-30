import Link from "next/link";
import { cn } from "@/lib/cn";
import { IMPORTANCE, REQUEST_TYPE_LABELS } from "@/lib/ai-format";
import { formatDateTime, formatRelative } from "@/lib/format";
import type { EmailListItem } from "@/lib/types";
import { EmptyState } from "@/components/ui/empty-state";
import { IconAlert, IconMail } from "@/components/ui/icons";

export function ImportanceBadge({ importance, className }: { importance?: EmailListItem["importance"]; className?: string }) {
  if (!importance) return null;
  const meta = IMPORTANCE[importance];
  return (
    <span className={cn("inline-flex items-center rounded-[5px] px-1.5 py-0.5 text-[9.5px] font-semibold ring-1 ring-inset", meta.badge, className)}>
      {meta.label}
    </span>
  );
}

const STATUS_LABELS: Record<EmailListItem["status"], string> = {
  new: "Ohne Analyse",
  queued: "Wird analysiert",
  analyzed: "Analysiert",
  skipped: "Duplikat",
  failed: "Fehler",
};

export function EmailList({ emails, emptyDescription }: { emails: EmailListItem[]; emptyDescription?: string }) {
  if (emails.length === 0) {
    return (
      <EmptyState
        icon={<IconMail className="h-4 w-4" />}
        title="Noch keine E-Mails"
        description={emptyDescription ?? "Neue Nachrichten verbundener Postfächer erscheinen hier nach dem nächsten Abruf."}
      />
    );
  }

  return (
    <ul className="card divide-y divide-line">
      {emails.map((email) => (
        <li key={email.id}>
          <Link href={`/ai/emails/${email.id}`} className="flex flex-col gap-1.5 px-4 py-3 hover:bg-surface-2/60">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <ImportanceBadge importance={email.importance} />
              {email.isCustomerRequest && (
                <span className="rounded-[5px] bg-accent-soft px-1.5 py-0.5 text-[9.5px] font-semibold text-accent">Kundenanfrage</span>
              )}
              {email.injectionSuspected && (
                <span className="inline-flex items-center gap-1 rounded-[5px] bg-rose-50 px-1.5 py-0.5 text-[9.5px] font-semibold text-rose-700">
                  <IconAlert className="h-3 w-3" />
                  Manipulationsversuch
                </span>
              )}
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-ink">{email.subject || "(ohne Betreff)"}</span>
              <time className="text-[11px] text-subtle" dateTime={email.receivedAt} title={formatDateTime(email.receivedAt)}>
                {formatRelative(email.receivedAt)}
              </time>
            </div>
            <p className="text-[11px] text-muted">
              {email.fromName ? `${email.fromName} · ` : ""}
              {email.fromAddress} · {email.connectionLabel}
              {email.requestType && ` · ${REQUEST_TYPE_LABELS[email.requestType] ?? email.requestType}`}
              {email.attachmentCount > 0 && ` · ${email.attachmentCount} Anhang/Anhänge`}
              {email.status !== "analyzed" && ` · ${STATUS_LABELS[email.status]}`}
            </p>
            {email.summary && <p className="line-clamp-2 text-[12px] leading-relaxed text-ink-2">{email.summary}</p>}
          </Link>
        </li>
      ))}
    </ul>
  );
}
