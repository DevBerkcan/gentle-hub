"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateEstimateSettingsAction } from "@/app/actions";
import type { EstimateSettings, PriceCatalogEntry } from "@/lib/types";
import { FormError, SuccessNote } from "@/components/ui/field";
import { IconCheck, IconLoader, IconPlus, IconTrash } from "@/components/ui/icons";

/**
 * Flat-price anchors for the estimate agent: typical packages with their usual
 * price, plus an optional risk surcharge on top of every estimate.
 */
export function EstimateSettingsForm({ settings }: { settings: EstimateSettings }) {
  const router = useRouter();
  const [catalog, setCatalog] = useState<PriceCatalogEntry[]>(settings.catalog);
  const [buffer, setBuffer] = useState(settings.bufferPercent);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function update(index: number, patch: Partial<PriceCatalogEntry>) {
    setCatalog((current) => current.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    const entries = catalog.filter((entry) => entry.title.trim() || entry.priceEur);
    if (entries.some((entry) => !entry.title.trim() || !(Number(entry.priceEur) > 0))) {
      setError("Jede Pauschale braucht einen Namen und einen Preis über 0 €.");
      return;
    }

    startTransition(async () => {
      const result = await updateEstimateSettingsAction(
        Number(buffer),
        entries.map((entry) => ({ title: entry.title.trim(), description: entry.description?.trim() || null, priceEur: Number(entry.priceEur) })),
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("Gespeichert. Der Schätz-Agent nutzt die Pauschalen ab der nächsten Schätzung.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="card flex flex-col gap-4 p-5" aria-labelledby="catalog-heading">
      <div>
        <h2 id="catalog-heading" className="text-[13px] font-semibold text-ink">
          Pauschalpreise
        </h2>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
          Gentle Group rechnet pauschal ab. Trag hier eure üblichen Pakete mit Netto-Preis ein, daran orientiert sich der
          Schätz-Agent zuerst. Danach an freigegebenen Schätzungen und deinen Gegenangeboten.
        </p>
      </div>
      <FormError message={error} />
      <SuccessNote message={message} />

      {catalog.length === 0 && (
        <p className="rounded-[10px] border border-dashed border-line px-4 py-3 text-[11.5px] text-muted">
          Noch keine Pauschalen hinterlegt. Ohne Katalog schätzt der Agent marktübliche Preise und lernt aus deinen Gegenangeboten.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {catalog.map((entry, index) => (
          <li key={index} className="grid grid-cols-1 gap-2 rounded-[10px] border border-line p-3 sm:grid-cols-[minmax(0,1fr)_140px_auto]">
            <div className="flex flex-col gap-1.5">
              <input
                className="input h-8 text-[12.5px] font-medium"
                placeholder="z. B. Website bis 5 Seiten"
                value={entry.title}
                maxLength={200}
                onChange={(event) => update(index, { title: event.target.value })}
                aria-label="Name der Pauschale"
              />
              <input
                className="input h-8 text-[12px]"
                placeholder="Was ist enthalten? (optional)"
                value={entry.description ?? ""}
                maxLength={1000}
                onChange={(event) => update(index, { description: event.target.value })}
                aria-label="Beschreibung"
              />
            </div>
            <label className="flex items-center gap-1.5 self-start">
              <input
                type="number"
                min="0"
                step="10"
                className="input h-8 text-right text-[12.5px] font-semibold tabular-nums"
                value={entry.priceEur || ""}
                onChange={(event) => update(index, { priceEur: Number(event.target.value) })}
                aria-label="Preis netto"
              />
              <span className="text-[12px] text-muted">€</span>
            </label>
            <button
              type="button"
              onClick={() => setCatalog((current) => current.filter((_, i) => i !== index))}
              className="btn btn-ghost btn-icon h-8 w-8 self-start text-rose-600"
              aria-label="Pauschale entfernen"
            >
              <IconTrash className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setCatalog((current) => [...current, { title: "", description: "", priceEur: 0 }])}
        className="btn btn-ghost h-8 w-fit text-[11.5px]"
      >
        <IconPlus className="h-3.5 w-3.5" />
        Pauschale hinzufügen
      </button>

      <label className="flex flex-col gap-1 sm:max-w-[240px]">
        <span className="label">Risikoaufschlag auf jede Schätzung</span>
        <div className="flex items-center gap-2">
          <input type="number" min="0" max="100" className="input" value={buffer} onChange={(event) => setBuffer(Number(event.target.value))} />
          <span className="text-[12px] text-muted">%</span>
        </div>
        <span className="text-[10.5px] text-subtle">0 %, wenn eure Pauschalen den Puffer schon enthalten.</span>
      </label>

      <div className="flex justify-end">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? <IconLoader className="h-3.5 w-3.5" /> : <IconCheck className="h-3.5 w-3.5" />}
          Speichern
        </button>
      </div>
    </form>
  );
}
