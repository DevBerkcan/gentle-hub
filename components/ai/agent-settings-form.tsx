"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateAiAgentAction } from "@/app/actions";
import { PERMISSION_LABELS } from "@/lib/ai-format";
import type { FieldErrors } from "@/lib/action-types";
import type { Agent, AgentPermissions } from "@/lib/types";
import { Field, FormError, SuccessNote } from "@/components/ui/field";
import { IconCheck, IconLoader } from "@/components/ui/icons";

export function AgentSettingsForm({ agent }: { agent: Agent }) {
  const router = useRouter();
  const [isEnabled, setIsEnabled] = useState(agent.isEnabled);
  const [model, setModel] = useState(agent.model);
  const [budget, setBudget] = useState(agent.monthlyBudgetEur == null ? "" : String(agent.monthlyBudgetEur));
  const [maxOutputTokens, setMaxOutputTokens] = useState(String(agent.maxOutputTokens));
  const [timeoutSeconds, setTimeoutSeconds] = useState(String(agent.timeoutSeconds));
  const [permissions, setPermissions] = useState<AgentPermissions>(agent.permissions);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const budgetValue = budget.trim() === "" ? null : Number(budget.replace(",", "."));
    const nextErrors: FieldErrors = {};
    if (budgetValue !== null && (!Number.isFinite(budgetValue) || budgetValue < 0)) {
      nextErrors.monthlyBudgetEur = "Bitte einen Betrag ab 0 € eingeben oder leer lassen.";
    }
    if (!model.trim()) nextErrors.model = "Modell angeben.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    startTransition(async () => {
      const result = await updateAiAgentAction(agent.id, {
        isEnabled,
        model: model.trim(),
        monthlyBudgetEur: budgetValue,
        clearMonthlyBudget: budgetValue === null,
        maxOutputTokens: Number(maxOutputTokens),
        timeoutSeconds: Number(timeoutSeconds),
        permissions,
      });
      if (!result.ok) {
        setError(result.error);
        setErrors(result.errors ?? {});
        return;
      }
      setMessage("Agent gespeichert.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="card flex flex-col gap-4 p-5" aria-labelledby="agent-settings-heading">
      <div className="flex items-center justify-between gap-3">
        <h2 id="agent-settings-heading" className="text-[13px] font-semibold text-ink">
          Konfiguration
        </h2>
        <label className="inline-flex cursor-pointer items-center gap-2 text-[12px] font-medium text-ink">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(event) => setIsEnabled(event.target.checked)}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          Agent aktiv
        </label>
      </div>

      <FormError message={error} />
      <SuccessNote message={message} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="KI-Modell" htmlFor="agent-model" error={errors.model} hint="„default“ nutzt das serverseitig konfigurierte Modell.">
          <input id="agent-model" className="input" value={model} onChange={(event) => setModel(event.target.value)} maxLength={80} />
        </Field>
        <Field
          label="Monatsbudget (€)"
          htmlFor="agent-budget"
          error={errors.monthlyBudgetEur}
          hint="Leer = nur das globale Budget gilt."
        >
          <input
            id="agent-budget"
            className="input"
            inputMode="decimal"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
            placeholder="z. B. 10"
          />
        </Field>
        <Field label="Max. Ausgabe-Tokens" htmlFor="agent-tokens" error={errors.maxOutputTokens}>
          <input
            id="agent-tokens"
            type="number"
            min={100}
            max={32000}
            className="input"
            value={maxOutputTokens}
            onChange={(event) => setMaxOutputTokens(event.target.value)}
          />
        </Field>
        <Field label="Zeitlimit (Sekunden)" htmlFor="agent-timeout" error={errors.timeoutSeconds}>
          <input
            id="agent-timeout"
            type="number"
            min={5}
            max={600}
            className="input"
            value={timeoutSeconds}
            onChange={(event) => setTimeoutSeconds(event.target.value)}
          />
        </Field>
      </div>

      <fieldset className="flex flex-col gap-2 border-t border-line pt-4">
        <legend className="label mb-1">Berechtigungen</legend>
        {PERMISSION_LABELS.map((permission) => (
          <label key={permission.key} className="flex cursor-pointer items-start gap-2.5 rounded-[8px] px-1 py-1 hover:bg-surface-2/60">
            <input
              type="checkbox"
              checked={permissions[permission.key]}
              onChange={(event) => setPermissions((current) => ({ ...current, [permission.key]: event.target.checked }))}
              className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
            />
            <span>
              <span className="block text-[12px] font-medium text-ink">{permission.label}</span>
              <span className="block text-[10.5px] text-muted">{permission.hint}</span>
            </span>
          </label>
        ))}
        <p className="mt-1 text-[10.5px] text-subtle">
          Zugangsdaten aus dem Tresor sind für Agenten grundsätzlich gesperrt, unabhängig von diesen Einstellungen.
        </p>
      </fieldset>

      <div className="flex justify-end">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? <IconLoader className="h-3.5 w-3.5" /> : <IconCheck className="h-3.5 w-3.5" />}
          {pending ? "Speichert …" : "Speichern"}
        </button>
      </div>
    </form>
  );
}
