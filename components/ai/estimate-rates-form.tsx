"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateEstimateRatesAction } from "@/app/actions";
import { cn } from "@/lib/cn";
import type { EstimateRole, EstimateSettings } from "@/lib/types";
import { FormError, SuccessNote } from "@/components/ui/field";
import { IconCheck, IconLoader } from "@/components/ui/icons";

const ROLES: { value: EstimateRole; label: string; hint: string }[] = [
  { value: "pm", label: "Projektleitung", hint: "Konzept, Abstimmung, Steuerung" },
  { value: "design", label: "Design", hint: "UX, UI, Branding" },
  { value: "dev", label: "Entwicklung", hint: "Frontend, Backend, Integrationen" },
  { value: "qa", label: "Qualitätssicherung", hint: "Tests, Abnahme" },
  { value: "marketing", label: "Marketing", hint: "Google Ads, SEO, Social Media" },
];

/** Your hourly rates; in hourly mode Emre only estimates hours and the server computes every price. */
export function EstimateRatesForm({ settings }: { settings: EstimateSettings }) {
  const router = useRouter();
  const [mode, setMode] = useState<"flat" | "hourly">(settings.pricingMode ?? "flat");
  const [rates, setRates] = useState<Record<EstimateRole, string>>(
    () => Object.fromEntries(ROLES.map((role) => [role.value, String(settings.rates[role.value] ?? "")])) as Record<EstimateRole, string>,
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    const parsed = Object.fromEntries(ROLES.map((role) => [role.value, Number(rates[role.value].replace(",", "."))]));
    if (Object.values(parsed).some((value) => !Number.isFinite(value) || value < 0 || value > 1000)) {
      setError("Stundensätze zwischen 0 und 1.000 € angeben.");
      return;
    }

    startTransition(async () => {
      const result = await updateEstimateRatesAction(mode, parsed as Record<EstimateRole, number>);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage(mode === "hourly" ? "Gespeichert. Emre schätzt ab jetzt Stunden, die Preise rechnet der Server aus deinen Sätzen." : "Gespeichert.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="card flex flex-col gap-4 p-5" aria-labelledby="rates-heading">
      <div>
        <h2 id="rates-heading" className="text-[13px] font-semibold text-ink">
          Stundensätze und Preisberechnung
        </h2>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
          Mit „Aus Stunden berechnen“ schätzt Emre nur realistische Stunden je Paket und Rolle. Den Preis rechnet der Server: Stunden × dein Satz. So
          kann das Modell nichts aufrunden. Produkte aus dem Pauschalkatalog behalten ihren festen Preis.
        </p>
      </div>
      <FormError message={error} />
      <SuccessNote message={message} />

      <fieldset className="flex flex-col gap-2 sm:flex-row">
        <legend className="sr-only">Preisberechnung</legend>
        {(
          [
            { value: "hourly", label: "Aus Stunden berechnen", hint: "Stunden × Stundensatz, genau und nachvollziehbar" },
            { value: "flat", label: "Pauschalen schätzen", hint: "Emre setzt Paketpreise selbst, orientiert am Katalog" },
          ] as const
        ).map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex flex-1 cursor-pointer items-start gap-2 rounded-[10px] border p-3 text-[11.5px]",
              mode === option.value ? "border-accent bg-accent/5" : "border-line",
            )}
          >
            <input type="radio" name="pricing-mode" className="mt-0.5" checked={mode === option.value} onChange={() => setMode(option.value)} />
            <span>
              <span className="block font-semibold text-ink">{option.label}</span>
              <span className="text-muted">{option.hint}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {ROLES.map((role) => (
          <label key={role.value} className="flex flex-col gap-1 rounded-[10px] border border-line p-3 text-[11.5px]">
            <span className="font-semibold text-ink">{role.label}</span>
            <span className="text-[10.5px] text-muted">{role.hint}</span>
            <span className="mt-1 flex items-center gap-1.5">
              <input
                className="input h-8 w-24 text-right tabular-nums"
                inputMode="decimal"
                value={rates[role.value]}
                onChange={(event) => setRates((current) => ({ ...current, [role.value]: event.target.value }))}
                aria-label={`Stundensatz ${role.label} in Euro`}
              />
              <span className="text-muted">€ / Std. netto</span>
            </span>
          </label>
        ))}
      </div>

      <div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? <IconLoader className="h-3.5 w-3.5" /> : <IconCheck className="h-3.5 w-3.5" />}
          Speichern
        </button>
      </div>
    </form>
  );
}
