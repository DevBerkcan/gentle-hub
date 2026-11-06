"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startReplyAction } from "@/app/actions";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";
import type { ReplyDraft, ReplyPurpose } from "@/lib/types";
import { IconLoader, IconMail } from "@/components/ui/icons";

const STATUS: Record<ReplyDraft["status"], { label: string; className: string }> = {
  pending_approval: { label: "Wartet auf Freigabe", className: "bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200" },
  sent: { label: "Gesendet", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" },
  rejected: { label: "Verworfen", className: "bg-surface-2 text-muted" },
  superseded: { label: "Ersetzt", className: "bg-surface-2 text-subtle" },
  failed: { label: "Fehlgeschlagen", className: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300" },
};

/** Reply drafts for one e-mail plus manual starts (first answer, offer mail). */
export function ReplyPanel({ emailId, replies, canOffer }: { emailId: string; replies: ReplyDraft[]; canOffer: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function start(purpose: ReplyPurpose) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await startReplyAction(emailId, purpose);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("Der Antwort-Agent schreibt den Entwurf (ca. 30 Sekunden). Du bekommst ihn unter Freigaben.");
      router.refresh();
    });
  }

  const visible = replies.filter((reply) => reply.status !== "superseded");

  return (
    <section className="card flex flex-col gap-3 p-5" aria-labelledby="replies-heading">
      <h2 id="replies-heading" className="flex items-center gap-2 text-[13.5px] font-semibold text-ink">
        <IconMail className="h-4 w-4 text-accent" />
        Antworten
      </h2>

      {visible.length === 0 ? (
        <p className="text-[12px] text-muted">Noch kein Antwortentwurf.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line">
          {visible.map((reply) => (
            <li key={reply.id} className="flex flex-wrap items-center gap-2 py-2 text-[12px]">
              <span className={cn("rounded-[5px] px-1.5 py-0.5 text-[10px] font-semibold", STATUS[reply.status].className)}>
                {STATUS[reply.status].label}
              </span>
              <span className="font-medium text-ink">{reply.purpose === "offer" ? "Angebotsmail" : "Erste Antwort"}</span>
              <span className="text-muted">
                {reply.sentAt ? `gesendet ${formatDateTime(reply.sentAt)}` : `erstellt ${formatDateTime(reply.createdAt)}`}
              </span>
              {reply.approvalId && (
                <Link href={`/ai/approvals/${reply.approvalId}`} className="ml-auto text-[11.5px] font-semibold text-accent hover:underline">
                  {reply.status === "pending_approval" ? "Prüfen & senden →" : "Ansehen →"}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => start("acknowledge")} disabled={pending} className="btn btn-secondary h-8 text-[11.5px]">
          {pending && <IconLoader className="h-3.5 w-3.5" />}
          Antwort entwerfen
        </button>
        {canOffer && (
          <button type="button" onClick={() => start("offer")} disabled={pending} className="btn btn-secondary h-8 text-[11.5px]">
            Angebotsmail entwerfen
          </button>
        )}
      </div>
      {message && <p className="text-[11px] text-emerald-700 dark:text-emerald-300">{message}</p>}
      {error && <p className="text-[11px] text-rose-600">{error}</p>}
    </section>
  );
}
