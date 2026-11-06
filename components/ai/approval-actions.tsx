"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { decideApprovalAction, regenerateEstimateAction, startEstimateForEmailAction } from "@/app/actions";
import { FormError } from "@/components/ui/field";
import { IconCheck, IconLoader, IconRefresh, IconSparkles, IconX } from "@/components/ui/icons";

/** Approve/reject exactly the version shown on screen (version + content hash). */
export function ApprovalDecision({
  approvalId,
  version,
  contentHash,
  estimateId,
  approveLabel,
  hint = "Genehmigen erstellt einen internen Angebotsentwurf. Es wird nichts an den Kunden gesendet.",
  disabledReason,
}: {
  approvalId: string;
  version: number;
  contentHash: string;
  estimateId?: string | null;
  approveLabel?: string;
  hint?: string;
  /** Set while the shown content has unsaved edits: deciding would apply to the old version. */
  disabledReason?: string | null;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function decide(approve: boolean) {
    setError(null);
    if (!approve && !note.trim()) {
      setError("Bitte kurz begründen, warum du ablehnst.");
      return;
    }

    startTransition(async () => {
      const result = await decideApprovalAction(approvalId, approve, version, contentHash, note);
      if (!result.ok) {
        setError(result.error);
        router.refresh();
        return;
      }
      router.refresh();
    });
  }

  function regenerate() {
    if (!estimateId) return;
    setError(null);
    startTransition(async () => {
      const result = await regenerateEstimateAction(estimateId);
      if (!result.ok) setError(result.error);
      else router.push("/ai/approvals");
    });
  }

  return (
    <section className="card sticky bottom-3 flex flex-col gap-3 p-4 shadow-lg sm:static sm:shadow-card" aria-label="Entscheidung">
      <FormError message={error} />
      {rejecting && (
        <textarea
          className="textarea min-h-16 text-[12.5px]"
          placeholder="Begründung (z. B. „Umfang zu groß, ohne Mitarbeiterverwaltung neu schätzen“)"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          autoFocus
        />
      )}
      <div className="flex flex-wrap gap-2">
        {!rejecting ? (
          <>
            <button
              type="button"
              onClick={() => decide(true)}
              disabled={pending || Boolean(disabledReason)}
              className="btn btn-primary flex-1 sm:flex-none"
            >
              {pending ? <IconLoader className="h-3.5 w-3.5" /> : <IconCheck className="h-3.5 w-3.5" />}
              {approveLabel ?? `Genehmigen (Version ${version})`}
            </button>
            <button
              type="button"
              onClick={() => setRejecting(true)}
              disabled={pending || Boolean(disabledReason)}
              className="btn btn-secondary text-rose-600"
            >
              <IconX className="h-3.5 w-3.5" />
              Ablehnen
            </button>
            {estimateId && (
              <button type="button" onClick={regenerate} disabled={pending} className="btn btn-ghost">
                <IconRefresh className="h-3.5 w-3.5" />
                Neu erzeugen
              </button>
            )}
          </>
        ) : (
          <>
            <button type="button" onClick={() => decide(false)} disabled={pending} className="btn btn-danger flex-1 sm:flex-none">
              {pending ? <IconLoader className="h-3.5 w-3.5" /> : <IconX className="h-3.5 w-3.5" />}
              Ablehnung bestätigen
            </button>
            <button type="button" onClick={() => setRejecting(false)} disabled={pending} className="btn btn-ghost">
              Abbrechen
            </button>
          </>
        )}
      </div>
      {disabledReason && <p className="text-[11px] font-medium text-amber-700">{disabledReason}</p>}
      <p className="text-[10.5px] text-subtle">{hint}</p>
    </section>
  );
}

export function StartEstimateButton({ emailId }: { emailId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await startEstimateForEmailAction(emailId);
            if (!result.ok) setError(result.error);
            else {
              setMessage("Notiz und Schätzung werden erstellt (ca. 1–2 Minuten).");
              router.refresh();
            }
          })
        }
        className="btn btn-secondary h-8 w-fit text-[11.5px]"
      >
        {pending ? <IconLoader className="h-3.5 w-3.5" /> : <IconSparkles className="h-3.5 w-3.5" />}
        Notiz und Schätzung erstellen
      </button>
      {message && <p className="text-[10.5px] text-emerald-700">{message}</p>}
      {error && <p className="text-[10.5px] text-rose-600">{error}</p>}
    </div>
  );
}
