"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addTenderAction, fetchTendersAction } from "@/app/actions";
import type { TenderManualInput } from "@/lib/types";

/** "Search TED now", paste a project from any portal, and refresh while Nora is still scoring. */
export function TenderToolbar({ scoring }: { scoring: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState<TenderManualInput>({ title: "", text: "" });

  // Only our own data is reloaded while Nora scores.
  useEffect(() => {
    if (!scoring) return;
    const timer = setInterval(() => router.refresh(), 6_000);
    return () => clearInterval(timer);
  }, [scoring, router]);

  function fetchNow() {
    setError(null);
    startTransition(async () => {
      const result = await fetchTendersAction();
      if (!result.ok) setError(result.error);
      else setMessage("Nora sucht bei TED. Neue Treffer erscheinen in ein bis zwei Minuten.");
      setTimeout(() => router.refresh(), 8_000);
    });
  }

  function add(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setErrors({});
    startTransition(async () => {
      const result = await addTenderAction({
        ...values,
        valueEur: values.valueEur ? Number(values.valueEur) : null,
        deadline: values.deadline || null,
        url: values.url || null,
        buyer: values.buyer || null,
      });
      if (!result.ok) {
        setError(result.error);
        setErrors(result.errors ?? {});
        return;
      }
      setValues({ title: "", text: "" });
      setMessage("Erfasst. Nora bewertet die Ausschreibung gleich.");
      router.push(`/ai/ausschreibungen/${result.id}`);
    });
  }

  const field = (key: keyof TenderManualInput, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="flex flex-col gap-1 text-[11.5px]">
      <span className="font-semibold text-ink">{label}</span>
      <input
        className="input"
        value={(values[key] as string | number | null | undefined) ?? ""}
        onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
        {...props}
      />
      {errors[key] && <span className="text-rose-600">{errors[key]}</span>}
    </label>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn btn-primary" disabled={pending} onClick={fetchNow}>
          Jetzt bei TED suchen
        </button>
        <span className="text-[11px] text-muted">Nora sucht zweimal am Tag automatisch. Portal-Alarme kommen über das Ausschreibungs-Postfach.</span>
      </div>
      {message && <p className="text-[11.5px] text-emerald-700">{message}</p>}
      {error && <p className="text-[11.5px] text-rose-600">{error}</p>}

      <details className="card p-4">
        <summary className="cursor-pointer list-none text-[12.5px] font-semibold text-ink">
          + Projekt oder Ausschreibung von Hand erfassen
          <span className="ml-2 text-[11px] font-normal text-muted">z. B. aus freelancermap, Malt, LinkedIn oder einer Anfrage per Telefon</span>
        </summary>
        <form onSubmit={add} className="mt-4 flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {field("title", "Titel *", { required: true, maxLength: 400 })}
            {field("buyer", "Auftraggeber", { maxLength: 300 })}
            {field("url", "Link", { placeholder: "https://…" })}
            {field("deadline", "Frist", { type: "date" })}
            {field("valueEur", "Budget / Wert (€ netto)", { inputMode: "decimal" })}
          </div>
          <label className="flex flex-col gap-1 text-[11.5px]">
            <span className="font-semibold text-ink">Beschreibung *</span>
            <textarea
              className="input min-h-32"
              required
              maxLength={20000}
              placeholder="Ausschreibungstext oder Projektbeschreibung hineinkopieren"
              value={values.text}
              onChange={(event) => setValues((current) => ({ ...current, text: event.target.value }))}
            />
            {errors.text && <span className="text-rose-600">{errors.text}</span>}
          </label>
          <div>
            <button type="submit" className="btn btn-primary" disabled={pending}>
              Erfassen und bewerten lassen
            </button>
          </div>
        </form>
      </details>
    </div>
  );
}
