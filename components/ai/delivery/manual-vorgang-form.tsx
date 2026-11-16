"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createManualVorgangAction } from "@/app/actions";
import type { SiteIntake } from "@/lib/types";

const FIELDS: { key: keyof SiteIntake; label: string; placeholder?: string; type?: string; required?: boolean }[] = [
  { key: "niche", label: "Branche", placeholder: "z. B. Kosmetikstudio", required: true },
  { key: "businessName", label: "Name (falls vorhanden)", placeholder: "leer lassen = Lara schlägt Namen vor" },
  { key: "city", label: "Stadt", placeholder: "z. B. Wuppertal" },
  { key: "instagram", label: "Instagram", placeholder: "studio.muster" },
  { key: "contactName", label: "Ansprechpartnerin" },
  { key: "website", label: "Bestehende Website", placeholder: "www.…" },
  { key: "email", label: "E-Mail", type: "email" },
  { key: "phone", label: "Telefon", type: "tel" },
];

/** A customer from Instagram, phone or a fair. Defne writes the requirements, Lara can then build the site. */
export function ManualVorgangForm() {
  const router = useRouter();
  const [values, setValues] = useState<SiteIntake>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setErrors({});
    startTransition(async () => {
      const result = await createManualVorgangAction(values);
      if (!result.ok) {
        setError(result.error);
        setErrors(result.errors ?? {});
        return;
      }
      router.push(`/ai/vorgaenge/${result.id}`);
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <label key={field.key} className="flex flex-col gap-1 text-[11.5px]">
            <span className="font-semibold text-ink">
              {field.label}
              {field.required && <span className="text-rose-600"> *</span>}
            </span>
            <input
              className="input"
              type={field.type ?? "text"}
              placeholder={field.placeholder}
              required={field.required}
              value={values[field.key] ?? ""}
              onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}
              aria-invalid={Boolean(errors[field.key]) || undefined}
            />
            {errors[field.key] && <span className="text-rose-600">{errors[field.key]}</span>}
          </label>
        ))}
      </div>
      <label className="flex flex-col gap-1 text-[11.5px]">
        <span className="font-semibold text-ink">Was sie geschrieben hat / Notizen</span>
        <textarea
          className="input min-h-28"
          maxLength={4000}
          placeholder="Nachricht aus Instagram hineinkopieren oder Stichworte aus dem Gespräch"
          value={values.notes ?? ""}
          onChange={(event) => setValues((current) => ({ ...current, notes: event.target.value }))}
        />
        {errors.notes && <span className="text-rose-600">{errors.notes}</span>}
      </label>
      {error && <p className="text-[11.5px] text-rose-600">{error}</p>}
      <div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Lege an…" : "Vorgang anlegen"}
        </button>
      </div>
    </form>
  );
}
