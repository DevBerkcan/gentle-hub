"use client";

import { useId, useState } from "react";
import type { ApplicationCategory, ApplicationInput } from "@/types";
import { CATEGORY_LABELS } from "@/data/applications";
import { LIMITS, validateApplicationInput, type FieldErrors } from "@/lib/validation";
import type { ActionResult } from "@/app/actions";
import { cn } from "@/lib/utils";

export const inputClass =
  "focus-ring h-10 w-full rounded-control border border-line bg-surface px-3 text-sm text-fg shadow-card placeholder:text-fg-subtle transition-colors duration-[var(--duration-fast)] hover:border-line-strong aria-[invalid=true]:border-red-500";

export const buttonClass = {
  primary:
    "focus-ring inline-flex h-9 items-center justify-center gap-1.5 rounded-control bg-fg px-3.5 text-sm font-medium text-bg transition-opacity duration-[var(--duration-fast)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40",
  secondary:
    "focus-ring inline-flex h-9 items-center justify-center gap-1.5 rounded-control border border-line bg-surface px-3.5 text-sm font-medium text-fg shadow-card transition-colors duration-[var(--duration-fast)] hover:border-line-strong disabled:cursor-not-allowed disabled:opacity-40",
  danger:
    "focus-ring inline-flex h-9 items-center justify-center gap-1.5 rounded-control bg-red-600 px-3.5 text-sm font-medium text-white transition-opacity duration-[var(--duration-fast)] hover:opacity-90 disabled:opacity-40",
};

type FormValues = Record<keyof ApplicationInput, string>;

function toValues(initial?: ApplicationInput): FormValues {
  return {
    url: initial?.url ?? "",
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    category: initial?.category ?? "saas",
    environment: initial?.environment ?? "",
    icon: initial?.icon ?? "",
  };
}

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: (props: { id: string; "aria-invalid": boolean; "aria-describedby"?: string }) => React.ReactNode;
}) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = error ?? hint;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-fg">
        {label}
      </label>
      {children({ id, "aria-invalid": !!error, "aria-describedby": message ? messageId : undefined })}
      {message && (
        <p id={messageId} className={cn("text-xs", error ? "text-red-600" : "text-fg-subtle")}>
          {message}
        </p>
      )}
    </div>
  );
}

type ApplicationFormProps = {
  initial?: ApplicationInput;
  submitLabel: string;
  onSubmit: (input: ApplicationInput) => Promise<ActionResult<object>>;
};

/** Link + details of an application. Validates locally, the server validates again. */
export function ApplicationForm({ initial, submitLabel, onSubmit }: ApplicationFormProps) {
  const [values, setValues] = useState<FormValues>(() => toValues(initial));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<{ kind: "idle" | "saving" | "saved" | "error"; message?: string }>({
    kind: "idle",
  });
  const isDirty = JSON.stringify(values) !== JSON.stringify(toValues(initial));

  function set<K extends keyof FormValues>(key: K, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setStatus({ kind: "idle" });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const result = validateApplicationInput(values);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setStatus({ kind: "saving" });
    const response = await onSubmit(result.value);
    if (response.ok) {
      setStatus({ kind: "saved" });
    } else {
      setErrors(response.errors ?? {});
      setStatus({ kind: "error", message: response.error });
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Field
        label="Link (wird mit „Öffnen“ aufgerufen)"
        error={errors.url}
        hint="Die Adresse, die beim Klick auf die Kachel geöffnet wird. https:// wird automatisch ergänzt."
      >
        {(props) => (
          <input
            {...props}
            type="text"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            maxLength={LIMITS.url}
            placeholder="https://www.gentlebook.de/superadmin/login"
            value={values.url}
            onChange={(event) => set("url", event.target.value)}
            className={inputClass}
          />
        )}
      </Field>
      <Field label="Name" error={errors.name}>
        {(props) => (
          <input
            {...props}
            maxLength={LIMITS.name}
            placeholder="GentleBook"
            value={values.name}
            onChange={(event) => set("name", event.target.value)}
            className={inputClass}
          />
        )}
      </Field>
      <Field label="Kurzbeschreibung" error={errors.description}>
        {(props) => (
          <input
            {...props}
            maxLength={LIMITS.description}
            placeholder="SaaS für Online-Terminbuchungen."
            value={values.description}
            onChange={(event) => set("description", event.target.value)}
            className={inputClass}
          />
        )}
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Kategorie" error={errors.category}>
          {(props) => (
            <select
              {...props}
              value={values.category}
              onChange={(event) => set("category", event.target.value)}
              className={inputClass}
            >
              {(Object.keys(CATEGORY_LABELS) as ApplicationCategory[]).map((category) => (
                <option key={category} value={category}>
                  {CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Umgebung" error={errors.environment}>
          {(props) => (
            <select
              {...props}
              value={values.environment}
              onChange={(event) => set("environment", event.target.value)}
              className={inputClass}
            >
              <option value="">Production</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
            </select>
          )}
        </Field>
      </div>
      <Field label="Logo (optional)" error={errors.icon} hint="https-Adresse eines Logos. Ohne Logo wird ein Kürzel angezeigt.">
        {(props) => (
          <input
            {...props}
            type="url"
            autoComplete="off"
            spellCheck={false}
            maxLength={LIMITS.icon}
            placeholder="https://…/logo.svg"
            value={values.icon}
            onChange={(event) => set("icon", event.target.value)}
            className={inputClass}
          />
        )}
      </Field>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={!isDirty || status.kind === "saving"} className={buttonClass.primary}>
          {status.kind === "saving" ? "Speichert…" : submitLabel}
        </button>
        <p className="text-xs text-fg-subtle" role="status" aria-live="polite">
          {status.kind === "saved" && "Gespeichert"}
          {status.kind === "error" && <span className="text-red-600">{status.message}</span>}
        </p>
      </div>
    </form>
  );
}
