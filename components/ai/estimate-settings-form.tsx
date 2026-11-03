"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateEstimateSettingsAction } from "@/app/actions";
import type { EstimateRole, EstimateSettings } from "@/lib/types";
import { FormError, SuccessNote } from "@/components/ui/field";
import { IconCheck, IconLoader } from "@/components/ui/icons";

const ROLES: { key: EstimateRole; label: string }[] = [
  { key: "pm", label: "Projektleitung / Konzeption" },
  { key: "design", label: "Design" },
  { key: "dev", label: "Entwicklung" },
  { key: "qa", label: "Qualitätssicherung" },
];

export function EstimateSettingsForm({ settings }: { settings: EstimateSettings }) {
  const router = useRouter();
  const [rates, setRates] = useState(settings.rates);
  const [buffer, setBuffer] = useState(settings.bufferPercent);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await updateEstimateSettingsAction(rates, Number(buffer));
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("Gespeichert. Gilt für alle neuen Schätzungen.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="card flex flex-col gap-4 p-5" aria-labelledby="rates-heading">
      <div>
        <h2 id="rates-heading" className="text-[13px] font-semibold text-ink">
          Stundensätze und Puffer
        </h2>
        <p className="mt-0.5 text-[11px] text-muted">
          Der Schätz-Agent liefert nur Stunden je Rolle. Beträge rechnet GentleHub mit diesen Sätzen (netto).
        </p>
      </div>
      <FormError message={error} />
      <SuccessNote message={message} />
      <div className="grid gap-3 sm:grid-cols-2">
        {ROLES.map((role) => (
          <label key={role.key} className="flex flex-col gap-1">
            <span className="label">{role.label}</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="1000"
                className="input"
                value={rates[role.key]}
                onChange={(event) => setRates((current) => ({ ...current, [role.key]: Number(event.target.value) }))}
              />
              <span className="text-[12px] text-muted">€/h</span>
            </div>
          </label>
        ))}
        <label className="flex flex-col gap-1">
          <span className="label">Projektpuffer</span>
          <div className="flex items-center gap-2">
            <input type="number" min="0" max="100" className="input" value={buffer} onChange={(event) => setBuffer(Number(event.target.value))} />
            <span className="text-[12px] text-muted">%</span>
          </div>
        </label>
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? <IconLoader className="h-3.5 w-3.5" /> : <IconCheck className="h-3.5 w-3.5" />}
          Speichern
        </button>
      </div>
    </form>
  );
}
