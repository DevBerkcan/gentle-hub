"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateAiSettingsAction } from "@/app/actions";
import type { AiSettings } from "@/lib/types";
import { Field, FormError, SuccessNote } from "@/components/ui/field";
import { IconCheck, IconLoader } from "@/components/ui/icons";

export function AiSettingsForm({ settings }: { settings: AiSettings }) {
  const router = useRouter();
  const [budget, setBudget] = useState(String(settings.globalMonthlyBudgetEur));
  const [enabled, setEnabled] = useState(settings.processingEnabled);
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    const value = Number(budget.replace(",", "."));
    if (!Number.isFinite(value) || value < 0) {
      setFieldError("Bitte einen Betrag ab 0 € eingeben.");
      return;
    }
    setFieldError(undefined);

    startTransition(async () => {
      const result = await updateAiSettingsAction({ globalMonthlyBudgetEur: value, processingEnabled: enabled });
      if (!result.ok) {
        setError(result.error);
        setFieldError(result.errors?.globalMonthlyBudgetEur);
        return;
      }
      setMessage("Einstellungen gespeichert.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="card flex flex-col gap-4 p-5" aria-labelledby="ai-settings-heading">
      <h2 id="ai-settings-heading" className="text-[13px] font-semibold text-ink">
        Verarbeitung & Budget
      </h2>
      <FormError message={error} />
      <SuccessNote message={message} />

      <label className="flex cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => setEnabled(event.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
        />
        <span>
          <span className="block text-[12.5px] font-medium text-ink">KI-Verarbeitung aktiv</span>
          <span className="block text-[11px] text-muted">
            Ausgeschaltet werden keine Jobs mehr abgearbeitet und keine KI-Aufrufe gestartet (Not-Aus).
          </span>
        </span>
      </label>

      <Field
        label="Globales Monatsbudget (€)"
        htmlFor="ai-budget"
        error={fieldError}
        hint="Ist es ausgeschöpft, startet kein Agent mehr. Reservierte und nachträglich gemeldete Kosten zählen mit."
      >
        <input
          id="ai-budget"
          className="input max-w-48"
          inputMode="decimal"
          value={budget}
          onChange={(event) => setBudget(event.target.value)}
        />
      </Field>

      <div className="flex justify-end">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? <IconLoader className="h-3.5 w-3.5" /> : <IconCheck className="h-3.5 w-3.5" />}
          {pending ? "Speichert …" : "Speichern"}
        </button>
      </div>
    </form>
  );
}
