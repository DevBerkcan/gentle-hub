"use client";

import { useState, useTransition } from "react";
import { createProjectAction, updateProjectAction } from "@/app/actions";
import type { FieldErrors } from "@/lib/action-types";
import { cn } from "@/lib/cn";
import { ACCENTS } from "@/lib/constants";
import { isValidHttpUrl, normalizeUrl, parseTags } from "@/lib/format";
import type { Project, ProjectInput, ProjectKind, ProjectStatus } from "@/lib/types";
import { Field, FormError } from "@/components/ui/field";
import { IconApps, IconLoader, IconUsers } from "@/components/ui/icons";

const EMOJI_CHOICES = [
  "🧭", "📅", "🧩", "🌿", "📝", "🍽️", "🥐", "📈", "🕌", "🌙", "🌗", "🚀",
  "🔧", "🌬️", "🧲", "🔴", "🏥", "🧰", "⚡", "❄️", "✨", "🧮", "💇", "🎟️",
  "🍬", "🥗", "🤝", "🌐",
];

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "live", label: "Live" },
  { value: "beta", label: "Beta" },
  { value: "development", label: "In Entwicklung" },
  { value: "paused", label: "Pausiert" },
  { value: "archived", label: "Archiviert" },
];

function toInput(project: Project): ProjectInput {
  return {
    kind: project.kind,
    name: project.name,
    description: project.description,
    status: project.status,
    primaryUrl: project.primaryUrl ?? "",
    icon: project.icon ?? "",
    accent: project.accent ?? (project.kind === "customer" ? "blue" : "mint"),
    tags: project.tags,
    notes: project.notes,
    contactName: project.customer?.contactName ?? "",
    contactEmail: project.customer?.contactEmail ?? "",
    contactPhone: project.customer?.contactPhone ?? "",
    companyWebsite: project.customer?.companyWebsite ?? "",
  };
}

function emptyInput(kind: ProjectKind): ProjectInput {
  return {
    kind,
    name: "",
    description: "",
    status: "live",
    primaryUrl: "",
    icon: "",
    accent: kind === "customer" ? "blue" : "mint",
    tags: [],
    notes: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    companyWebsite: "",
  };
}

export function ProjectForm({
  mode,
  project,
  defaultKind = "internal",
  onSuccess,
  onCancel,
}: {
  mode: "create" | "edit";
  project?: Project;
  defaultKind?: ProjectKind;
  onSuccess: (slug: string) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<ProjectInput>(() =>
    project ? toInput(project) : emptyInput(defaultKind),
  );
  const [tagText, setTagText] = useState(project?.tags.join(", ") ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isCustomer = form.kind === "customer";
  const formId = mode === "create" ? "create-project-form" : "edit-project-form";

  function update<K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) {
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
    if (!form.name.trim()) nextErrors.name = "Bitte einen Namen angeben.";

    const primaryUrl = normalizeUrl(form.primaryUrl);
    if (primaryUrl && !isValidHttpUrl(primaryUrl)) {
      nextErrors.primaryUrl = "Bitte eine gültige Adresse angeben, z. B. https://example.com.";
    }

    const companyWebsite = normalizeUrl(form.companyWebsite);
    if (isCustomer && companyWebsite && !isValidHttpUrl(companyWebsite)) {
      nextErrors.companyWebsite = "Bitte eine gültige Web-Adresse angeben.";
    }

    if (isCustomer && form.contactEmail.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(form.contactEmail.trim())) {
      nextErrors.contactEmail = "Bitte eine gültige E-Mail-Adresse angeben.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload: ProjectInput = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      primaryUrl,
      icon: form.icon.trim(),
      tags: parseTags(tagText),
      notes: form.notes,
      contactName: form.contactName.trim(),
      contactEmail: form.contactEmail.trim(),
      contactPhone: form.contactPhone.trim(),
      companyWebsite,
    };

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createProjectAction(payload)
          : await updateProjectAction(project!.slug, payload);

      if (!result.ok) {
        setErrors(result.errors ?? {});
        setMessage(result.error);
        return;
      }

      const slug =
        mode === "create" && "slug" in result && typeof result.slug === "string"
          ? result.slug
          : project!.slug;
      onSuccess(slug);
    });
  }

  return (
    <form id={formId} onSubmit={submit} className="flex flex-col gap-5">
      <FormError message={message} />

      {mode === "create" && (
        <div className="grid grid-cols-2 gap-2 rounded-[14px] border border-line bg-surface-2 p-1.5">
          {(
            [
              { value: "internal", label: "Eigene App", icon: IconApps, hint: "Gentle Group" },
              { value: "customer", label: "Kunde", icon: IconUsers, hint: "Kundenprojekt" },
            ] as const
          ).map((option) => {
            const active = form.kind === option.value;
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setForm((current) => ({
                    ...current,
                    kind: option.value,
                    accent:
                      current.accent === "mint" || current.accent === "blue"
                        ? option.value === "customer"
                          ? "blue"
                          : "mint"
                        : current.accent,
                  }));
                }}
                className={cn(
                  "flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-left transition",
                  active ? "bg-white shadow-[0_1px_2px_rgb(11_16_42/0.08)]" : "hover:bg-white/60",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-[9px]",
                    active ? "bg-navy text-mint" : "bg-white text-muted",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold text-ink">{option.label}</span>
                  <span className="block text-[10.5px] text-muted">{option.hint}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      <Field label="Name" htmlFor={`${formId}-name`} error={errors.name} required>
        <input
          id={`${formId}-name`}
          value={form.name}
          onChange={(event) => update("name", event.target.value)}
          placeholder={isCustomer ? "z. B. Gelenkwerk Physio" : "z. B. GentleBook"}
          className="input"
          maxLength={160}
          autoFocus
        />
      </Field>

      <Field label="Kurzbeschreibung" htmlFor={`${formId}-description`} error={errors.description}>
        <textarea
          id={`${formId}-description`}
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
          placeholder="Worum geht es? Ein bis zwei Sätze reichen."
          className="textarea min-h-20"
          maxLength={800}
          rows={2}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
        <Field
          label={isCustomer ? "Website" : "Haupt-Link"}
          htmlFor={`${formId}-url`}
          hint="Ohne https:// wird automatisch ergänzt."
          error={errors.primaryUrl}
        >
          <input
            id={`${formId}-url`}
            value={form.primaryUrl}
            onChange={(event) => update("primaryUrl", event.target.value)}
            placeholder="https://…"
            className="input"
            inputMode="url"
          />
        </Field>

        <Field label="Status" htmlFor={`${formId}-status`} error={errors.status}>
          <select
            id={`${formId}-status`}
            value={form.status}
            onChange={(event) => update("status", event.target.value as ProjectStatus)}
            className="select"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Icon" htmlFor={`${formId}-icon`} hint="Ein Emoji oder leer für Initialen." error={errors.icon}>
          <div className="flex gap-2">
            <input
              id={`${formId}-icon`}
              value={form.icon}
              onChange={(event) => update("icon", event.target.value)}
              placeholder="✨"
              className="input w-16 text-center text-lg"
              maxLength={32}
            />
            <div className="no-scrollbar flex flex-1 items-center gap-1 overflow-x-auto rounded-[12px] border border-line bg-white px-2">
              {EMOJI_CHOICES.slice(0, 12).map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => update("icon", emoji)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-[16px] transition hover:bg-surface-2"
                  aria-label={`Icon ${emoji} wählen`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </Field>

        <Field label="Farbe" error={errors.accent}>
          <div className="flex h-11 items-center gap-2 rounded-[12px] border border-line bg-white px-3">
            {ACCENTS.map((accent) => (
              <button
                key={accent.key}
                type="button"
                onClick={() => update("accent", accent.key)}
                aria-label={`Farbe ${accent.label}`}
                aria-pressed={form.accent === accent.key}
                className={cn(
                  "h-6 w-6 rounded-full ring-2 ring-offset-2 transition",
                  accent.dot,
                  form.accent === accent.key ? "ring-ink" : "ring-transparent hover:scale-110",
                )}
              />
            ))}
            <span className="ml-auto text-[11px] font-medium text-muted">
              {ACCENTS.find((accent) => accent.key === form.accent)?.label ?? "Mint"}
            </span>
          </div>
        </Field>
      </div>

      {isCustomer && (
        <fieldset className="rounded-[16px] border border-line bg-surface-2/60 p-4">
          <legend className="px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
            Kundenkontakt
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ansprechpartner" htmlFor={`${formId}-contact`} error={errors.contactName}>
              <input
                id={`${formId}-contact`}
                value={form.contactName}
                onChange={(event) => update("contactName", event.target.value)}
                placeholder="Vor- und Nachname"
                className="input"
                maxLength={160}
              />
            </Field>
            <Field label="E-Mail" htmlFor={`${formId}-email`} error={errors.contactEmail}>
              <input
                id={`${formId}-email`}
                value={form.contactEmail}
                onChange={(event) => update("contactEmail", event.target.value)}
                placeholder="kontakt@kunde.de"
                className="input"
                inputMode="email"
                maxLength={255}
              />
            </Field>
            <Field label="Telefon" htmlFor={`${formId}-phone`} error={errors.contactPhone}>
              <input
                id={`${formId}-phone`}
                value={form.contactPhone}
                onChange={(event) => update("contactPhone", event.target.value)}
                placeholder="+49 …"
                className="input"
                inputMode="tel"
                maxLength={80}
              />
            </Field>
            <Field label="Firmen-Website" htmlFor={`${formId}-company`} error={errors.companyWebsite}>
              <input
                id={`${formId}-company`}
                value={form.companyWebsite}
                onChange={(event) => update("companyWebsite", event.target.value)}
                placeholder="https://…"
                className="input"
                inputMode="url"
              />
            </Field>
          </div>
        </fieldset>
      )}

      <Field
        label="Schlagwörter"
        htmlFor={`${formId}-tags`}
        hint="Kommagetrennt, maximal 10 Stück."
        error={errors.tags}
      >
        <input
          id={`${formId}-tags`}
          value={tagText}
          onChange={(event) => setTagText(event.target.value)}
          placeholder="SaaS, Website, Intern"
          className="input"
        />
      </Field>

      <Field
        label="Notizen"
        htmlFor={`${formId}-notes`}
        hint="Hinweise, Ansprechpartner, To-dos. Secrets gehören unter Zugänge & Infrastruktur."
        error={errors.notes}
      >
        <textarea
          id={`${formId}-notes`}
          value={form.notes}
          onChange={(event) => update("notes", event.target.value)}
          placeholder="Was ist bei diesem Projekt wichtig?"
          className="textarea"
          rows={4}
        />
      </Field>

      <div className="sticky bottom-0 -mx-5 -mb-5 mt-1 flex items-center justify-end gap-2 border-t border-line bg-white/95 px-5 py-3.5 backdrop-blur sm:-mx-6 sm:px-6">
        <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={pending}>
          Abbrechen
        </button>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending && <IconLoader className="h-4 w-4" />}
          {pending
            ? "Speichert …"
            : mode === "create"
              ? isCustomer
                ? "Kunde anlegen"
                : "App anlegen"
              : "Änderungen speichern"}
        </button>
      </div>
    </form>
  );
}
