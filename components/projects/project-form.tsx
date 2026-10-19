"use client";

import { useState, useTransition } from "react";
import { createProjectAction, updateProjectAction } from "@/app/actions";
import type { FieldErrors } from "@/lib/action-types";
import { cn } from "@/lib/cn";
import { isValidHttpUrl, normalizeUrl, parseTags } from "@/lib/format";
import type { Project, ProjectInput, ProjectKind, ProjectStatus } from "@/lib/types";
import { Field, FormError } from "@/components/ui/field";
import { ProjectIcon } from "@/components/ui/project-icon";
import { IconApps, IconFolder, IconLoader, IconUsers } from "@/components/ui/icons";

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "live", label: "Live" },
  { value: "beta", label: "Beta" },
  { value: "development", label: "In Entwicklung" },
  { value: "paused", label: "Pausiert" },
  { value: "archived", label: "Archiviert" },
];

const KIND_OPTIONS: {
  value: ProjectKind;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "internal", label: "Gentle Group", hint: "Eigenes Produkt", icon: IconApps },
  { value: "customer", label: "Kunde", hint: "Kundenprojekt", icon: IconUsers },
  { value: "project", label: "Eigenes Projekt", hint: "Game / Experiment", icon: IconFolder },
];

function toInput(project: Project): ProjectInput {
  return {
    kind: project.kind,
    name: project.name,
    description: project.description,
    status: project.status,
    primaryUrl: project.primaryUrl ?? "",
    icon: project.icon ?? "",
    accent: project.accent ?? "",
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
    accent: "",
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
  const isProject = form.kind === "project";
  const formId = mode === "create" ? "create-project-form" : "edit-project-form";
  const submitLabel =
    mode === "create"
      ? form.kind === "internal"
        ? "App anlegen"
        : form.kind === "customer"
          ? "Kunde anlegen"
          : "Projekt anlegen"
      : "Änderungen speichern";

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

    if (
      isCustomer &&
      form.contactEmail.trim() &&
      !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(form.contactEmail.trim())
    ) {
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
    <form id={formId} onSubmit={submit} className="flex flex-col gap-4">
      <FormError message={message} />

      {mode === "create" && (
        <div className="grid gap-1.5 sm:grid-cols-3">
          {KIND_OPTIONS.map((option) => {
            const active = form.kind === option.value;
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => update("kind", option.value)}
                aria-pressed={active}
                className={cn(
                  "flex items-center gap-2 rounded-[8px] border px-2.5 py-2 text-left transition",
                  active
                    ? "border-ink/20 bg-surface-2 ring-1 ring-inset ring-ink/5"
                    : "border-line bg-white hover:border-line-strong hover:bg-surface-2",
                )}
              >
                <Icon className={cn("h-4 w-4", active ? "text-ink" : "text-muted")} />
                <span className="min-w-0">
                  <span className="block text-[11.5px] font-semibold text-ink">{option.label}</span>
                  <span className="block text-[9.5px] text-muted">{option.hint}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-[1fr_170px]">
        <Field label="Name" htmlFor={`${formId}-name`} error={errors.name} required>
          <input
            id={`${formId}-name`}
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder={
              form.kind === "internal"
                ? "z. B. GentleBook"
                : form.kind === "customer"
                  ? "z. B. Gelenkwerk Physio"
                  : "z. B. Twinshade"
            }
            className="input"
            maxLength={160}
            autoFocus
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

      <Field label="Kurzbeschreibung" htmlFor={`${formId}-description`} error={errors.description}>
        <textarea
          id={`${formId}-description`}
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
          placeholder="Ein bis zwei Sätze."
          className="textarea min-h-[70px]"
          maxLength={800}
          rows={2}
        />
      </Field>

      <Field
        label={isCustomer ? "Website" : isProject ? "Haupt-Link" : "Produkt-Link"}
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

      <Field
        label="Logo"
        htmlFor={`${formId}-icon`}
        hint="Pfad wie /apps/gentlebook.png oder eine HTTPS-URL. Leer = Initialen."
        error={errors.icon}
      >
        <div className="flex items-center gap-3">
          <ProjectIcon
            name={form.name || "Projekt"}
            icon={form.icon}
            size="lg"
            className="shrink-0"
          />
          <input
            id={`${formId}-icon`}
            value={form.icon}
            onChange={(event) => update("icon", event.target.value)}
            placeholder="/apps/… oder https://…"
            className="input flex-1"
            maxLength={1000}
          />
        </div>
      </Field>

      {isCustomer && (
        <fieldset className="rounded-[10px] border border-line bg-surface-2/50 p-3.5">
          <legend className="px-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
            Kundenkontakt
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
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
        hint="Hinweise und To-dos. Secrets gehören unter Zugänge & Infrastruktur."
        error={errors.notes}
      >
        <textarea
          id={`${formId}-notes`}
          value={form.notes}
          onChange={(event) => update("notes", event.target.value)}
          placeholder="Was ist bei diesem Projekt wichtig?"
          className="textarea"
          rows={3}
        />
      </Field>

      <div className="sticky bottom-0 -mx-5 -mb-5 mt-1 flex items-center justify-end gap-2 border-t border-line bg-white/95 px-5 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={pending}>
          Abbrechen
        </button>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending && <IconLoader className="h-4 w-4" />}
          {pending ? "Speichert …" : submitLabel}
        </button>
      </div>
    </form>
  );
}
