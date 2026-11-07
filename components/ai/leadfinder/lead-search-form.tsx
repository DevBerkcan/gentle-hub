"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startLeadSearchAction } from "@/app/actions";
import { cn } from "@/lib/cn";
import type { FieldErrors } from "@/lib/action-types";
import type { LeadCategoryOption } from "@/lib/types";
import { FormError } from "@/components/ui/field";
import { IconLoader, IconSearch } from "@/components/ui/icons";

const RADII = [5, 10, 20, 30, 50];

/** Where and what Arda should look for. Nothing is contacted; it only collects. */
export function LeadSearchForm({ categories, disabled }: { categories: LeadCategoryOption[]; disabled?: string | null }) {
  const router = useRouter();
  const [location, setLocation] = useState("Wuppertal");
  const [radius, setRadius] = useState(20);
  const [selected, setSelected] = useState<string[]>(["friseur"]);
  const [custom, setCustom] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const groups = categories.reduce<Record<string, LeadCategoryOption[]>>((all, category) => {
    (all[category.group] ??= []).push(category);
    return all;
  }, {});

  function toggle(key: string) {
    setSelected((current) => (current.includes(key) ? current.filter((k) => k !== key) : [...current, key]));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setErrors({});
    setMessage(null);
    startTransition(async () => {
      const result = await startLeadSearchAction({ location: location.trim(), radiusKm: radius, categories: selected, customCategory: custom.trim() || null });
      if (!result.ok) {
        setError(result.error);
        setErrors(result.errors ?? {});
        return;
      }
      setMessage("Arda sucht. Die Liste füllt sich in den nächsten Minuten.");
      router.refresh();
    });
  }

  const count = selected.length + (custom.trim() ? 1 : 0);

  return (
    <form onSubmit={submit} className="card flex flex-col gap-4 p-5" aria-labelledby="leadsearch-heading">
      <h2 id="leadsearch-heading" className="text-[13px] font-semibold text-ink">
        Neue Suche
      </h2>
      <FormError message={error ?? disabled ?? null} />
      {message && <p className="text-[12px] text-emerald-700 dark:text-emerald-300">{message}</p>}

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <label className="flex flex-col gap-1">
          <span className="label">Ort</span>
          <input
            className="input"
            value={location}
            maxLength={120}
            placeholder="z. B. Wuppertal oder 42103 Wuppertal"
            aria-invalid={Boolean(errors.location)}
            onChange={(event) => setLocation(event.target.value)}
          />
          {errors.location && <span className="text-[10.5px] text-rose-600">{errors.location}</span>}
        </label>
        <fieldset className="flex flex-col gap-1">
          <legend className="label mb-1">Umkreis</legend>
          <div className="flex flex-wrap gap-1">
            {RADII.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={radius === value}
                onClick={() => setRadius(value)}
                className={cn("btn h-9 px-3 text-[12px]", radius === value ? "btn-primary" : "btn-ghost border border-line")}
              >
                {value} km
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="label mb-1">Branchen {count > 0 && <span className="font-normal text-muted">({count} gewählt, höchstens 8)</span>}</legend>
        {Object.entries(groups).map(([group, items]) => (
          <div key={group} className="flex flex-wrap items-center gap-1.5">
            <span className="w-28 shrink-0 text-[10.5px] font-semibold uppercase tracking-wide text-subtle">{group}</span>
            {items.map((category) => {
              const active = selected.includes(category.key);
              return (
                <button
                  key={category.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle(category.key)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11.5px] transition",
                    active
                      ? "border-amber-400 bg-amber-100 font-semibold text-amber-900 dark:border-amber-400/60 dark:bg-amber-500/20 dark:text-amber-100"
                      : "border-line text-muted hover:text-ink",
                  )}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
        ))}
        {errors.categories && <span className="text-[10.5px] text-rose-600">{errors.categories}</span>}
        <label className="mt-1 flex flex-col gap-1 sm:max-w-sm">
          <span className="label">Andere Branche (optional)</span>
          <input
            className="input"
            value={custom}
            maxLength={60}
            placeholder="z. B. Hundesalon, Yogastudio"
            aria-invalid={Boolean(errors.customCategory)}
            onChange={(event) => setCustom(event.target.value)}
          />
          {errors.customCategory && <span className="text-[10.5px] text-rose-600">{errors.customCategory}</span>}
        </label>
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[10.5px] leading-relaxed text-subtle">
          Die Suche selbst ist bei Google kostenlos. Pro gefundenem Betrieb fällt ein Detail-Abruf an; die ersten 900 im Monat sind frei, danach
          stoppt Arda automatisch.
        </p>
        <button type="submit" disabled={pending || count === 0 || Boolean(disabled)} className="btn btn-primary">
          {pending ? <IconLoader className="h-3.5 w-3.5" /> : <IconSearch className="h-3.5 w-3.5" />}
          Leads suchen
        </button>
      </div>
    </form>
  );
}
