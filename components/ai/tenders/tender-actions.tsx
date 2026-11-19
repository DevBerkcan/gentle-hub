"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { rescoreTenderAction, setTenderStatusAction, tenderToVorgangAction } from "@/app/actions";
import type { Tender, TenderStatus } from "@/lib/types";

const STEPS: { status: TenderStatus; label: string; needsReason?: boolean; primary?: boolean }[] = [
  { status: "bid", label: "Wir bewerben uns", primary: true },
  { status: "submitted", label: "Eingereicht" },
  { status: "won", label: "Gewonnen" },
  { status: "lost", label: "Verloren", needsReason: true },
  { status: "skipped", label: "Lassen" },
];

/** Your decision and the result. The reason is what Nora learns from. */
export function TenderActions({ tender }: { tender: Tender }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [asking, setAsking] = useState<TenderStatus | null>(null);
  const [reason, setReason] = useState("");

  function run(action: () => Promise<{ ok: boolean; error?: string; id?: string }>, after?: (id?: string) => void) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Fehlgeschlagen.");
        return;
      }
      setAsking(null);
      setReason("");
      after?.(result.id);
      router.refresh();
    });
  }

  const canRescore = ["new", "scored", "failed"].includes(tender.status);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {STEPS.filter((step) => step.status !== tender.status).map((step) => (
          <button
            key={step.status}
            type="button"
            disabled={pending}
            className={step.primary && tender.status === "scored" ? "btn btn-primary" : "btn btn-secondary"}
            onClick={() => setAsking(step.status)}
          >
            {step.label}
          </button>
        ))}
        {canRescore && (
          <button type="button" className="btn btn-ghost" disabled={pending} onClick={() => run(() => rescoreTenderAction(tender.id))}>
            Neu bewerten
          </button>
        )}
        {tender.status === "won" && (
          <button
            type="button"
            className="btn btn-primary"
            disabled={pending}
            onClick={() => run(() => tenderToVorgangAction(tender.id), (id) => id && router.push(`/ai/vorgaenge/${id}`))}
          >
            {tender.workflowId ? "Zum Vorgang" : "Als Vorgang übernehmen"}
          </button>
        )}
      </div>

      {asking && (
        <div className="flex flex-col gap-2 rounded-lg border border-line p-3 text-[11.5px]">
          <label className="flex flex-col gap-1">
            <span className="font-semibold text-ink">
              {asking === "lost" ? "Warum verloren? (Pflicht)" : asking === "skipped" ? "Warum lassen? (optional)" : "Notiz (optional)"}
            </span>
            <textarea
              className="input min-h-16"
              maxLength={1000}
              placeholder={asking === "lost" ? "z. B. Preis zu hoch, fehlende Referenzen, Mitbewerber mit Branchenerfahrung" : ""}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-primary h-7 px-2 text-[11px]"
              disabled={pending || (STEPS.find((s) => s.status === asking)?.needsReason && !reason.trim())}
              onClick={() => run(() => setTenderStatusAction(tender.id, asking, reason.trim() || null))}
            >
              Speichern
            </button>
            <button type="button" className="btn btn-ghost h-7 px-2 text-[11px]" onClick={() => setAsking(null)}>
              Abbrechen
            </button>
          </div>
        </div>
      )}
      {error && <p className="text-[11.5px] text-rose-600">{error}</p>}
    </div>
  );
}
