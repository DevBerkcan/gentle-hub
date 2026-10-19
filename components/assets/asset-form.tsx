"use client";

import { useState, useTransition } from "react";
import { createAssetAction, updateAssetAction } from "@/app/actions";
import type { FieldErrors } from "@/lib/action-types";
import { cn } from "@/lib/cn";
import {
  ASSET_TYPE_LABELS,
  ENVIRONMENTS,
  PROVIDER_SUGGESTIONS,
  SUBTYPE_LABELS,
} from "@/lib/constants";
import { isValidHttpUrl, normalizeUrl } from "@/lib/format";
import type { Asset, AssetInput, AssetType } from "@/lib/types";
import { Field, FormError } from "@/components/ui/field";
import { AssetTypeIcon } from "@/components/assets/asset-type-icon";
import { IconEye, IconEyeOff, IconLoader } from "@/components/ui/icons";

const TYPE_OPTIONS: { value: AssetType; hint: string }[] = [
  { value: "link", hint: "Website oder Web-App" },
  { value: "repo", hint: "GitHub, GitLab & Co." },
  { value: "hosting", hint: "Vercel, Server, DNS" },
  { value: "database", hint: "MSSQL, Postgres, MySQL" },
  { value: "account", hint: "Login oder Testkonto" },
  { value: "secret", hint: "Connection String, Key" },
];

const EMPTY: AssetInput = {
  type: "link",
  subtype: "",
  label: "",
  url: "",
  provider: "",
  environment: "",
  username: "",
  secret: "",
  details: "",
  notes: "",
  clearSecret: false,
};

function toInput(asset: Asset): AssetInput {
  return {
    type: asset.type,
    subtype: asset.subtype ?? (asset.type === "secret" ? "other" : ""),
    label: asset.label,
    url: asset.url ?? "",
    provider: asset.provider ?? "",
    environment: asset.environment ?? "",
    username: asset.username ?? "",
    secret: "",
    details: asset.details,
    notes: asset.notes,
    clearSecret: false,
  };
}

function urlLabel(type: AssetType): string {
  switch (type) {
    case "repo":
      return "Repository-URL";
    case "hosting":
      return "Dashboard-URL";
    case "database":
      return "Host / Server";
    case "account":
      return "Login-URL";
    default:
      return "URL";
  }
}

function secretLabel(type: AssetType): string {
  switch (type) {
    case "database":
      return "Passwort";
    case "hosting":
      return "Passwort / Token";
    case "account":
      return "Passwort";
    case "secret":
      return "Geheimer Wert";
    default:
      return "Passwort / Token";
  }
}

function detailsPlaceholder(type: AssetType): string {
  switch (type) {
    case "repo":
      return "Branch, Sprache, Besonderheiten …";
    case "hosting":
      return "Projekt, Plan, Region, Deploy-Branch …";
    case "database":
      return "Datenbankname, Port, Collation …";
    case "account":
      return "2FA, Rolle, wofür der Zugang ist …";
    case "secret":
      return "Wofür ist der Wert? Umgebung, Ablaufdatum …";
    default:
      return "Zusätzliche Informationen …";
  }
}

export function AssetForm({
  mode,
  projectSlug,
  asset,
  defaultType = "link",
  onSuccess,
  onCancel,
}: {
  mode: "create" | "edit";
  projectSlug: string;
  asset?: Asset;
  defaultType?: AssetType;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<AssetInput>(() =>
    asset ? toInput(asset) : { ...EMPTY, type: defaultType, subtype: defaultType === "secret" ? "other" : "" },
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [pending, startTransition] = useTransition();

  const formId = mode === "create" ? "create-asset-form" : "edit-asset-form";
  const type = form.type;
  const hasStoredSecret = Boolean(asset?.hasSecret && !form.clearSecret);
  const showUrl = type !== "secret";
  const showEnvironment = type !== "secret";
  const showUsername = type === "hosting" || type === "database" || type === "account" || type === "repo";
  const showClear = mode === "edit" && Boolean(asset?.hasSecret);

  function update<K extends keyof AssetInput>(key: K, value: AssetInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function changeType(nextType: AssetType) {
    setForm((current) => ({
      ...current,
      type: nextType,
      subtype: nextType === "secret" ? current.subtype || "other" : "",
    }));
    setErrors({});
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const nextErrors: FieldErrors = {};
    if (!form.label.trim()) nextErrors.label = "Bitte eine Bezeichnung angeben.";

    const normalizedUrl =
      type === "database" ? form.url.trim() : normalizeUrl(form.url);

    if ((type === "link" || type === "repo") && !normalizedUrl) {
      nextErrors.url = "Bitte eine URL angeben.";
    } else if (normalizedUrl && type !== "database" && !isValidHttpUrl(normalizedUrl)) {
      nextErrors.url = "Bitte eine gültige Web-Adresse angeben.";
    }

    if (type === "secret" && mode === "create" && !form.secret.trim()) {
      nextErrors.secret = "Bitte den geheimen Wert eingeben.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload: AssetInput = {
      ...form,
      label: form.label.trim(),
      url: normalizedUrl,
      provider: form.provider.trim(),
      environment: form.environment,
      username: form.username.trim(),
      secret: form.clearSecret ? "" : form.secret,
      details: form.details.trim(),
      notes: form.notes.trim(),
      subtype: type === "secret" ? form.subtype || "other" : "",
      clearSecret: form.clearSecret,
    };

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createAssetAction(projectSlug, payload)
          : await updateAssetAction(asset!.id, payload);

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
        <p className="label mb-2">Art des Eintrags</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {TYPE_OPTIONS.map((option) => {
            const active = form.type === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => changeType(option.value)}
                aria-pressed={active}
                className={cn(
                  "flex items-center gap-2.5 rounded-[12px] border px-2.5 py-2.5 text-left transition",
                  active
                    ? "border-ink/15 bg-white shadow-[0_2px_10px_-4px_rgb(11_16_42/0.18)] ring-1 ring-ink/10"
                    : "border-line bg-surface-2/60 hover:border-line-strong hover:bg-white",
                )}
              >
                <AssetTypeIcon type={option.value} className="h-8 w-8 rounded-[9px]" />
                <span className="min-w-0">
                  <span className="block text-[12px] font-semibold text-ink">
                    {ASSET_TYPE_LABELS[option.value]}
                  </span>
                  <span className="block truncate text-[10px] text-muted">{option.hint}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Field label="Bezeichnung" htmlFor={`${formId}-label`} error={errors.label} required>
        <input
          id={`${formId}-label`}
          value={form.label}
          onChange={(event) => update("label", event.target.value)}
          placeholder={
            type === "secret"
              ? "z. B. Connection String Produktion"
              : type === "account"
                ? "z. B. Admin-Testkonto"
                : "z. B. Produktionsdatenbank"
          }
          className="input"
          maxLength={160}
          autoFocus
        />
      </Field>

      {type === "secret" && (
        <Field label="Unterkategorie" htmlFor={`${formId}-subtype`} error={errors.subtype}>
          <select
            id={`${formId}-subtype`}
            value={form.subtype}
            onChange={(event) => update("subtype", event.target.value)}
            className="select"
          >
            {Object.entries(SUBTYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      )}

      <div className={cn("grid gap-4", showUrl && showEnvironment ? "sm:grid-cols-[1fr_180px]" : "")}>
        {showUrl && (
          <Field
            label={urlLabel(type)}
            htmlFor={`${formId}-url`}
            error={errors.url}
            hint={type === "database" ? "Hostname oder Serveradresse, z. B. db123.example.net" : "Ohne https:// wird automatisch ergänzt."}
            required={type === "link" || type === "repo"}
          >
            <input
              id={`${formId}-url`}
              value={form.url}
              onChange={(event) => update("url", event.target.value)}
              placeholder={
                type === "database"
                  ? "db74483.databaseasp.net"
                  : type === "repo"
                    ? "https://github.com/…"
                    : "https://…"
              }
              className="input"
              inputMode={type === "database" ? "text" : "url"}
            />
          </Field>
        )}

        {showEnvironment && (
          <Field label="Umgebung" htmlFor={`${formId}-env`} error={errors.environment}>
            <select
              id={`${formId}-env`}
              value={form.environment}
              onChange={(event) => update("environment", event.target.value)}
              className="select"
            >
              <option value="">Keine Angabe</option>
              {Object.entries(ENVIRONMENTS).map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.label}
                </option>
              ))}
            </select>
          </Field>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Anbieter / Plattform" htmlFor={`${formId}-provider`} error={errors.provider}>
          <input
            id={`${formId}-provider`}
            value={form.provider}
            onChange={(event) => update("provider", event.target.value)}
            placeholder="Vercel, GitHub, MonsterASP …"
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

        {showUsername && (
          <Field
            label="Benutzername / Account"
            htmlFor={`${formId}-username`}
            error={errors.username}
          >
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
        )}
      </div>

      <Field
        label={secretLabel(type)}
        htmlFor={`${formId}-secret`}
        error={errors.secret}
        hint={
          hasStoredSecret
            ? "Leer lassen, um das gespeicherte Geheimnis unverändert zu lassen."
            : "Wird verschlüsselt gespeichert und nur nach ausdrücklicher Anzeige entschlüsselt."
        }
      >
        <div className="relative">
          {type === "secret" ? (
            <textarea
              id={`${formId}-secret`}
              value={form.secret}
              onChange={(event) => update("secret", event.target.value)}
              placeholder={
                hasStoredSecret
                  ? "Unverändert lassen …"
                  : "Server=…;Database=…;User Id=…;Password=…;"
              }
              className="textarea min-h-28 pr-10 font-mono text-[12px]"
              autoComplete="off"
              spellCheck={false}
            />
          ) : (
            <input
              id={`${formId}-secret`}
              type={showSecret ? "text" : "password"}
              value={form.secret}
              onChange={(event) => update("secret", event.target.value)}
              placeholder={hasStoredSecret ? "Unverändert lassen …" : "••••••••••••"}
              className="input pr-11 font-mono text-[12px]"
              autoComplete="new-password"
              maxLength={20_000}
            />
          )}
          {type !== "secret" && (
            <button
              type="button"
              onClick={() => setShowSecret((current) => !current)}
              aria-label={showSecret ? "Geheimnis verbergen" : "Geheimnis anzeigen"}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-[8px] text-subtle transition hover:bg-[#f0edf6] hover:text-ink"
            >
              {showSecret ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
            </button>
          )}
        </div>
        {showClear && (
          <label className="mt-2 inline-flex w-fit cursor-pointer items-center gap-2 rounded-[8px] bg-rose-50 px-2.5 py-1.5 text-[11.5px] font-medium text-rose-700">
            <input
              type="checkbox"
              checked={form.clearSecret === true}
              onChange={(event) => update("clearSecret", event.target.checked)}
              className="h-3.5 w-3.5 rounded border-rose-300 accent-rose-600"
            />
            Gespeichertes Geheimnis löschen
          </label>
        )}
      </Field>

      <Field label="Details" htmlFor={`${formId}-details`} error={errors.details}>
        <textarea
          id={`${formId}-details`}
          value={form.details}
          onChange={(event) => update("details", event.target.value)}
          placeholder={detailsPlaceholder(type)}
          className="textarea min-h-20"
          rows={3}
        />
      </Field>

      <Field label="Notizen" htmlFor={`${formId}-notes`} error={errors.notes}>
        <textarea
          id={`${formId}-notes`}
          value={form.notes}
          onChange={(event) => update("notes", event.target.value)}
          placeholder="Interne Hinweise, Ansprechpartner, Ablaufdatum …"
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
          {pending ? "Speichert …" : mode === "create" ? "Eintrag hinzufügen" : "Änderungen speichern"}
        </button>
      </div>
    </form>
  );
}
