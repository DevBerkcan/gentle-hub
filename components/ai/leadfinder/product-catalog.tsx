"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveOutreachProductsAction } from "@/app/actions";
import { cn } from "@/lib/cn";
import type { FieldErrors } from "@/lib/action-types";
import type { LeadCategoryOption, OutreachKind, OutreachProduct } from "@/lib/types";
import { FormError } from "@/components/ui/field";
import { IconCheck, IconLoader, IconPlus, IconTrash } from "@/components/ui/icons";

const KINDS: { value: OutreachKind; label: string }[] = [
  { value: "trial", label: "Testphase" },
  { value: "funnel", label: "Funnel / Anfrage" },
  { value: "service", label: "Dienstleistung" },
];

type Row = Omit<OutreachProduct, "id"> & { id?: string; key: string };

/** The products Cem may offer, with the sign-up or funnel link the team maintains. */
export function ProductCatalog({ initial, categories }: { initial: OutreachProduct[]; categories: LeadCategoryOption[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(() => initial.map((p) => ({ ...p, key: p.id })));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const missingLinks = rows.filter((r) => r.isActive && r.kind !== "service" && !r.url).length;

  function update(index: number, change: Partial<Row>) {
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...change } : row)));
  }

  function save() {
    setError(null);
    setErrors({});
    startTransition(async () => {
      const result = await saveOutreachProductsAction(
        rows.map((row) => ({
          id: row.id,
          name: row.name,
          pitch: row.pitch,
          kind: row.kind,
          url: row.url?.trim() || null,
          trialDays: row.kind === "trial" ? (row.trialDays ?? 14) : null,
          categories: row.categories,
          forNoWebsite: row.forNoWebsite,
          isActive: row.isActive,
        })),
      );
      if (!result.ok) {
        setError(result.error);
        setErrors(result.errors ?? {});
        return;
      }
      setRows(result.items.map((p) => ({ ...p, key: p.id })));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    });
  }

  return (
    <details className="card p-5" open={missingLinks > 0}>
      <summary className="cursor-pointer text-[13px] font-semibold text-ink">
        Produkte für die Ansprache
        {missingLinks > 0 && <span className="ml-2 text-[11px] font-normal text-amber-700 dark:text-amber-300">{missingLinks} ohne Test-Link</span>}
      </summary>
      <p className="mt-1 text-[11px] leading-relaxed text-muted">
        Cem wählt pro Lead das passende Produkt nach Branche; Betriebe ohne eigene Website bekommen das Website-Angebot. Den Link zur Testphase oder zum
        Funnel setzt der Server ein, die KI erfindet keine Links.
      </p>
      <FormError message={error} />
      <ul className="mt-3 flex flex-col gap-3">
        {rows.map((row, index) => (
          <li key={row.key} className={cn("flex flex-col gap-2 rounded-[10px] border border-line p-3", !row.isActive && "opacity-60")}>
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_150px_110px]">
              <input className="input" value={row.name} maxLength={80} placeholder="Produktname" aria-label="Produktname" onChange={(e) => update(index, { name: e.target.value })} />
              <select className="input" value={row.kind} aria-label="Art" onChange={(e) => update(index, { kind: e.target.value as OutreachKind })}>
                {KINDS.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </select>
              {row.kind === "trial" ? (
                <label className="flex items-center gap-1.5 text-[11.5px] text-muted">
                  <input
                    type="number"
                    min={1}
                    max={90}
                    className="input w-16"
                    value={row.trialDays ?? 14}
                    aria-label="Testtage"
                    onChange={(e) => update(index, { trialDays: Number(e.target.value) })}
                  />
                  Tage
                </label>
              ) : (
                <span />
              )}
            </div>
            {errors[`products.${index}.name`] && <span className="text-[10.5px] text-rose-600">{errors[`products.${index}.name`]}</span>}
            <textarea
              className="textarea min-h-14 text-[12px]"
              value={row.pitch}
              maxLength={400}
              placeholder="Was bringt das Produkt dem Betrieb? (1–2 Sätze)"
              aria-label="Kurzbeschreibung"
              onChange={(e) => update(index, { pitch: e.target.value })}
            />
            {errors[`products.${index}.pitch`] && <span className="text-[10.5px] text-rose-600">{errors[`products.${index}.pitch`]}</span>}
            <input
              className="input"
              value={row.url ?? ""}
              maxLength={300}
              placeholder={row.kind === "service" ? "Link zum Anfrage-Funnel (optional)" : "https://… Link zur Anmeldung / Testphase"}
              aria-label="Link"
              aria-invalid={Boolean(errors[`products.${index}.url`])}
              onChange={(e) => update(index, { url: e.target.value })}
            />
            {errors[`products.${index}.url`] && <span className="text-[10.5px] text-rose-600">{errors[`products.${index}.url`]}</span>}
            <div className="flex flex-wrap gap-1">
              {categories.map((category) => {
                const active = row.categories.includes(category.key);
                return (
                  <button
                    key={category.key}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      update(index, { categories: active ? row.categories.filter((c) => c !== category.key) : [...row.categories, category.key] })
                    }
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[10.5px]",
                      active ? "border-amber-400 bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-100" : "border-line text-muted",
                    )}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[11.5px] text-ink">
              <label className="flex items-center gap-1.5">
                <input type="checkbox" checked={row.forNoWebsite} onChange={(e) => update(index, { forNoWebsite: e.target.checked })} />
                Für Betriebe ohne eigene Website
              </label>
              <label className="flex items-center gap-1.5">
                <input type="checkbox" checked={row.isActive} onChange={(e) => update(index, { isActive: e.target.checked })} />
                Aktiv
              </label>
              {!row.id && (
                <button type="button" className="btn btn-ghost ml-auto h-7 px-2 text-[11px] text-rose-600" onClick={() => setRows((r) => r.filter((_, i) => i !== index))}>
                  <IconTrash className="h-3 w-3" />
                  Entfernen
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap justify-between gap-2">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() =>
            setRows((r) => [
              ...r,
              { key: `new-${Date.now()}`, name: "", pitch: "", kind: "trial", url: "", trialDays: 14, categories: [], forNoWebsite: false, isActive: true },
            ])
          }
        >
          <IconPlus className="h-3.5 w-3.5" />
          Produkt hinzufügen
        </button>
        <button type="button" className="btn btn-primary" onClick={save} disabled={pending}>
          {pending ? <IconLoader className="h-3.5 w-3.5" /> : <IconCheck className="h-3.5 w-3.5" />}
          {saved ? "Gespeichert" : "Speichern"}
        </button>
      </div>
      <p className="mt-2 text-[10.5px] text-subtle">Gespeicherte Produkte werden nicht gelöscht, nur deaktiviert.</p>
    </details>
  );
}
