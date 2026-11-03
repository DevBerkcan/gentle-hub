"use client";

import { useState, useTransition } from "react";
import { saveCredentialAction } from "@/app/actions";
import type { FieldErrors } from "@/lib/action-types";
import { cn } from "@/lib/cn";
import { CREDENTIAL_CATEGORIES, PROVIDER_SUGGESTIONS } from "@/lib/constants";
import { normalizeUrl } from "@/lib/format";
import type { Credential, CredentialCategory, CredentialInput } from "@/lib/types";
import { Field, FormError } from "@/components/ui/field";
import { CategoryIcon } from "@/components/vault/category-icon";
import { IconEye, IconEyeOff, IconLoader } from "@/components/ui/icons";

const EMPTY: CredentialInput = {
  category: "email",
  label: "",
  url: "",
  username: "",
  password: "",
  provider: "",
  notes: "",
  clearPassword: false,
};

function toInput(credential: Credential): CredentialInput {
  return {
    category: credential.category,
    label: credential.label,
    url: credential.url ?? "",
    username: credential.username ?? "",
    password: "",
    provider: credential.provider ?? "",
    notes: credential.notes,
    clearPassword: false,
    isFavorite: credential.isFavorite,
  };
}

export function CredentialForm({
  mode,
  credential,
  defaultCategory = "email",
  onSuccess,
  onCancel,
}: {
  mode: "create" | "edit";
  credential?: Credential;
  defaultCategory?: CredentialCategory;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<CredentialInput>(() =>
    credential ? toInput(credential) : { ...EMPTY, category: defaultCategory },
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, startTransition] = useTransition();

  const formId = mode === "create" ? "create-credential-form" : "edit-credential-form";
  const hasStoredPassword = Boolean(credential?.hasPassword && !form.clearPassword);

  function update<K extends keyof CredentialInput>(key: K, value: CredentialInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const nextErrors: FieldErrors = {};
    if (!form.label.trim()) nextErrors.label = "Bitte eine Bezeichnung angeben.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload: CredentialInput = {
      ...form,
      label: form.label.trim(),
      url: form.url.trim() ? normalizeUrl(form.url) : "",
      username: form.username.trim(),
      provider: form.provider.trim(),
      notes: form.notes.trim(),
      password: form.clearPassword ? "" : form.password,
    };

    startTransition(async () => {
      const result = await saveCredentialAction(credential?.id ?? null, payload);

      if (!result.ok) {
        setErrors(result.errors ?? {});
        setMessage(result.error);
        return;
      }

      onSuccess();
    });
  }

  return (
    <form id={formId} onSubmit={submit} className="flex flex-col gap-5">
      <FormError message={message} />

      <div>
        <p className="label mb-2">Kategorie</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CREDENTIAL_CATEGORIES.map((option) => {
            const active = form.category === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => update("category", option.key)}
                aria-pressed={active}
                title={option.description}
                className={cn(
                  "flex items-center gap-2.5 rounded-[10px] border px-2.5 py-2 text-left transition",
                  active
                    ? "border-ink/15 bg-surface shadow-[0_2px_10px_-4px_rgb(11_16_42/0.18)] ring-1 ring-ink/10"
                    : "border-line bg-surface-2/60 hover:border-line-strong hover:bg-surface",
                )}
              >
                <CategoryIcon category={option.key} className="h-7 w-7 rounded-[6px]" />
                <span className="min-w-0">
                  <span className="block text-[12px] font-semibold text-ink">{option.label}</span>
                  <span className="block truncate text-[10px] text-muted">{option.description}</span>
                </span>
              </button>
            );
          })}
        </div>
        {errors.category && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.category}</p>}
      </div>

      <Field label="Bezeichnung" htmlFor={`${formId}-label`} error={errors.label} required>
        <input
          id={`${formId}-label`}
          value={form.label}
          onChange={(event) => update("label", event.target.value)}
          placeholder="z. B. Webmail Büro"
          className="input"
          maxLength={200}
          autoFocus
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Adresse / Login-URL"
          htmlFor={`${formId}-url`}
          error={errors.url}
          hint="Optional. Ohne https:// wird automatisch ergänzt."
        >
          <input
            id={`${formId}-url`}
            value={form.url}
            onChange={(event) => update("url", event.target.value)}
            placeholder="https://webmail01.webhosting.systems"
            className="input"
            inputMode="url"
            maxLength={1000}
          />
        </Field>

        <Field label="Anbieter" htmlFor={`${formId}-provider`} error={errors.provider}>
          <input
            id={`${formId}-provider`}
            value={form.provider}
            onChange={(event) => update("provider", event.target.value)}
            placeholder="MonsterASP, GitHub, Vercel …"
            className="input"
            list={`${formId}-providers`}
            maxLength={120}
          />
          <datalist id={`${formId}-providers`}>
            {PROVIDER_SUGGESTIONS.map((provider) => (
              <option key={provider} value={provider} />
            ))}
          </datalist>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Benutzername / Login" htmlFor={`${formId}-username`} error={errors.username}>
          <input
            id={`${formId}-username`}
            value={form.username}
            onChange={(event) => update("username", event.target.value)}
            placeholder="name@example.com"
            className="input"
            autoComplete="off"
            maxLength={320}
          />
        </Field>

        <Field
          label="Passwort"
          htmlFor={`${formId}-password`}
          error={errors.password}
          hint={
            hasStoredPassword
              ? "Leer lassen, um das gespeicherte Passwort unverändert zu lassen."
              : "Wird AES-256-GCM verschlüsselt gespeichert."
          }
        >
          <div className="relative">
            <input
              id={`${formId}-password`}
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(event) => update("password", event.target.value)}
              placeholder={hasStoredPassword ? "Unverändert lassen …" : "••••••••••••"}
              className="input pr-11 font-mono text-[12px]"
              autoComplete="new-password"
              maxLength={20_000}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-[8px] text-subtle transition hover:bg-surface-2 hover:text-ink"
            >
              {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
            </button>
          </div>
          {mode === "edit" && credential?.hasPassword && (
            <label className="mt-2 inline-flex w-fit cursor-pointer items-center gap-2 rounded-[8px] bg-rose-50 px-2.5 py-1.5 text-[11.5px] font-medium text-rose-700">
              <input
                type="checkbox"
                checked={form.clearPassword === true}
                onChange={(event) => update("clearPassword", event.target.checked)}
                className="h-3.5 w-3.5 rounded border-rose-300 accent-rose-600"
              />
              Gespeichertes Passwort löschen
            </label>
          )}
        </Field>
      </div>

      <Field label="Notizen" htmlFor={`${formId}-notes`} error={errors.notes}>
        <textarea
          id={`${formId}-notes`}
          value={form.notes}
          onChange={(event) => update("notes", event.target.value)}
          placeholder="2FA, Postfachgröße, Ansprechpartner, Ablaufdatum …"
          className="textarea min-h-20"
          rows={2}
        />
      </Field>

      <div className="sticky bottom-0 -mx-5 -mb-5 mt-1 flex items-center justify-end gap-2 border-t border-line bg-white/95 px-5 py-3.5 backdrop-blur sm:-mx-6 sm:px-6">
        <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={pending}>
          Abbrechen
        </button>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending && <IconLoader className="h-4 w-4" />}
          {pending ? "Speichert …" : mode === "create" ? "Passwort speichern" : "Änderungen speichern"}
        </button>
      </div>
    </form>
  );
}
