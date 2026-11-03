"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { counterOfferAction } from "@/app/actions";
import { formatEur } from "@/lib/ai-format";
import { formatDateTime } from "@/lib/format";
import type { CounterOffer } from "@/lib/types";
import { FormError, SuccessNote } from "@/components/ui/field";
import { IconLoader, IconSparkles } from "@/components/ui/icons";

/**
 * Answer the estimate agent with your own price and instructions. The agent
 * revises the packages into a new version (new approval) and keeps the
 * counter-offer as orientation for future requests.
 */
export function CounterOfferForm({ estimateId, agentTotal }: { estimateId: string; agentTotal: number }) {
  const router = useRouter();
  const [target, setTarget] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    const value = target.trim() ? Number(target.replace(/\./g, "").replace(",", ".")) : null;
    if (value !== null && !(value > 0)) {
      setError("Bitte einen Zielpreis über 0 € eingeben oder das Feld leer lassen.");
      return;
    }
    if (value === null && !note.trim()) {
      setError("Gib einen Zielpreis, einen Hinweis oder beides an.");
      return;
    }

    startTransition(async () => {
      const result = await counterOfferAction(estimateId, value, note);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("Gegenangebot gesendet. Der Agent überarbeitet die Schätzung, die neue Fassung erscheint gleich unter Freigaben.");
      setTarget("");
      setNote("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="card flex flex-col gap-3 p-4" aria-labelledby="counter-heading">
      <div>
        <h2 id="counter-heading" className="text-[13px] font-semibold text-ink">
          Gegenangebot an den Agenten
        </h2>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
          Der Agent liegt bei {formatEur(agentTotal)} netto. Nenn deinen Preis und/oder was anders sein soll. Er baut die Pakete
          passend um, und dein Preis dient ihm künftig als Orientierung.
        </p>
      </div>
      <FormError message={error} />
      <SuccessNote message={message} />
      <label className="flex flex-col gap-1">
        <span className="label">Dein Zielpreis (netto, pauschal)</span>
        <div className="flex items-center gap-2">
          <input
            inputMode="decimal"
            className="input tabular-nums"
            placeholder="z. B. 3.500"
            value={target}
            onChange={(event) => setTarget(event.target.value)}
          />
          <span className="text-[12px] text-muted">€</span>
        </div>
      </label>
      <label className="flex flex-col gap-1">
        <span className="label">Hinweis für den Agenten</span>
        <textarea
          className="textarea min-h-20 text-[12.5px] leading-relaxed"
          placeholder="z. B. „Terminbuchung über ein Standard-Plugin, kein eigenes Backend. SEO weglassen.“"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={2000}
        />
      </label>
      <button type="submit" disabled={pending} className="btn btn-primary w-full sm:w-fit">
        {pending ? <IconLoader className="h-3.5 w-3.5" /> : <IconSparkles className="h-3.5 w-3.5" />}
        Überarbeiten lassen
      </button>
    </form>
  );
}

export function CounterOfferHistory({ items }: { items: CounterOffer[] }) {
  if (items.length === 0) return null;
  return (
    <section className="card flex flex-col gap-3 p-4" aria-labelledby="counter-history-heading">
      <h2 id="counter-history-heading" className="text-[12.5px] font-semibold text-ink">
        Gegenangebote
      </h2>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.id} className="flex flex-col gap-0.5 border-l-2 border-brand/60 pl-3 text-[11.5px]">
            <p className="font-medium text-ink">
              {formatEur(item.agentTotalEur)} → {item.targetTotalEur != null ? formatEur(item.targetTotalEur) : "nur Hinweis"}
            </p>
            {item.note && <p className="leading-relaxed text-muted">„{item.note}“</p>}
            <p className="text-[10.5px] text-subtle">
              {item.createdBy} · {formatDateTime(item.createdAt)}
              {item.resultEstimateId ? " · überarbeitet" : " · wird bearbeitet"}
            </p>
          </li>
        ))}
      </ul>
      <Link href="/ai/approvals" className="text-[11px] font-semibold text-accent hover:underline">
        Zu den offenen Freigaben →
      </Link>
    </section>
  );
}
