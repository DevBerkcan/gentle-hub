"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveEmailConnectionAction } from "@/app/actions";
import type { FieldErrors } from "@/lib/action-types";
import type { EmailConnection, EmailConnectionInput, MailSecurity } from "@/lib/types";
import { Modal } from "@/components/ui/modal";
import { Field, FormError } from "@/components/ui/field";
import { IconCheck, IconLoader, IconPencil, IconPlus } from "@/components/ui/icons";

function initialInput(connection?: EmailConnection): EmailConnectionInput {
  return {
    label: connection?.label ?? "",
    emailAddress: connection?.emailAddress ?? "",
    username: connection?.username ?? "",
    password: "",
    imapHost: connection?.imapHost ?? "",
    imapPort: connection?.imapPort ?? 993,
    imapSecurity: connection?.imapSecurity ?? "ssl",
    smtpHost: connection?.smtpHost ?? "",
    smtpPort: connection?.smtpPort ?? 465,
    smtpSecurity: connection?.smtpSecurity ?? "ssl",
    folder: connection?.folder ?? "INBOX",
    isEnabled: connection?.isEnabled ?? true,
    analysisEnabled: connection?.analysisEnabled ?? true,
  };
}

export function MailboxFormButton({ connection, disabled }: { connection?: EmailConnection; disabled?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState<EmailConnectionInput>(() => initialInput(connection));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(connection);

  function set<K extends keyof EmailConnectionInput>(key: K, value: EmailConnectionInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function show() {
    setInput(initialInput(connection));
    setErrors({});
    setError(null);
    setOpen(true);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const nextErrors: FieldErrors = {};
    if (!input.emailAddress.includes("@")) nextErrors.emailAddress = "Gültige E-Mail-Adresse angeben.";
    if (!isEdit && !input.password) nextErrors.password = "Passwort angeben.";
    if (!input.imapHost.trim()) nextErrors.imapHost = "IMAP-Server angeben.";
    if (!input.smtpHost.trim()) nextErrors.smtpHost = "SMTP-Server angeben.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    startTransition(async () => {
      const result = await saveEmailConnectionAction(connection?.id ?? null, {
        ...input,
        username: input.username.trim() || input.emailAddress.trim(),
      });
      if (!result.ok) {
        setError(result.error);
        setErrors(result.errors ?? {});
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={show}
        disabled={disabled}
        className={isEdit ? "btn btn-ghost h-8 px-2 text-[11.5px]" : "btn btn-primary"}
      >
        {isEdit ? <IconPencil className="h-3.5 w-3.5" /> : <IconPlus className="h-3.5 w-3.5" />}
        {isEdit ? "Bearbeiten" : "Postfach hinzufügen"}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={isEdit ? "Postfach bearbeiten" : "Postfach hinzufügen"}
        description="Server und Ports findest du im netcup Webhosting Control Panel unter „E-Mail-Adressen“. Nur verschlüsselte Verbindungen."
        size="lg"
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost">
              Abbrechen
            </button>
            <button type="submit" form="mailbox-form" disabled={pending} className="btn btn-primary">
              {pending ? <IconLoader className="h-3.5 w-3.5" /> : <IconCheck className="h-3.5 w-3.5" />}
              {pending ? "Speichert …" : "Speichern"}
            </button>
          </>
        }
      >
        <form id="mailbox-form" onSubmit={submit} className="flex flex-col gap-4">
          <FormError message={error} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="E-Mail-Adresse" htmlFor="mb-address" error={errors.emailAddress} required>
              <input
                id="mb-address"
                type="email"
                className="input"
                value={input.emailAddress}
                onChange={(event) => set("emailAddress", event.target.value)}
                autoComplete="off"
              />
            </Field>
            <Field label="Bezeichnung" htmlFor="mb-label" hint="z. B. „Allgemein“ oder „Office“">
              <input id="mb-label" className="input" value={input.label} onChange={(event) => set("label", event.target.value)} maxLength={120} />
            </Field>
            <Field label="Benutzername" htmlFor="mb-user" hint="Leer = E-Mail-Adresse">
              <input
                id="mb-user"
                className="input"
                value={input.username}
                onChange={(event) => set("username", event.target.value)}
                autoComplete="off"
              />
            </Field>
            <Field
              label="Passwort"
              htmlFor="mb-password"
              error={errors.password}
              required={!isEdit}
              hint={isEdit ? "Leer lassen, um das gespeicherte Passwort zu behalten." : "Wird nur serverseitig verschlüsselt gespeichert."}
            >
              <input
                id="mb-password"
                type="password"
                className="input"
                value={input.password}
                onChange={(event) => set("password", event.target.value)}
                autoComplete="new-password"
              />
            </Field>
          </div>

          <ServerFields
            prefix="imap"
            label="IMAP (Empfang)"
            host={input.imapHost}
            port={input.imapPort}
            security={input.imapSecurity}
            errors={errors}
            onHost={(value) => set("imapHost", value)}
            onPort={(value) => set("imapPort", value)}
            onSecurity={(value) => set("imapSecurity", value)}
          />
          <ServerFields
            prefix="smtp"
            label="SMTP (Versand, nur nach Freigabe)"
            host={input.smtpHost}
            port={input.smtpPort}
            security={input.smtpSecurity}
            errors={errors}
            onHost={(value) => set("smtpHost", value)}
            onPort={(value) => set("smtpPort", value)}
            onSecurity={(value) => set("smtpSecurity", value)}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ordner" htmlFor="mb-folder" error={errors.folder}>
              <input id="mb-folder" className="input" value={input.folder} onChange={(event) => set("folder", event.target.value)} />
            </Field>
            <div className="flex flex-col gap-2 pt-5">
              <Toggle label="Postfach aktiv" checked={input.isEnabled} onChange={(value) => set("isEnabled", value)} />
              <Toggle label="KI-Analyse neuer E-Mails" checked={input.analysisEnabled} onChange={(value) => set("analysisEnabled", value)} />
            </div>
          </div>
          <p className="text-[11px] leading-relaxed text-muted">
            Beim ersten Abruf werden vorhandene Nachrichten nicht importiert, nur neu eingehende. GentleHub liest nur, markiert
            nichts als gelesen und löscht keine E-Mails.
          </p>
        </form>
      </Modal>
    </>
  );
}

function ServerFields({
  prefix,
  label,
  host,
  port,
  security,
  errors,
  onHost,
  onPort,
  onSecurity,
}: {
  prefix: "imap" | "smtp";
  label: string;
  host: string;
  port: number;
  security: MailSecurity;
  errors: FieldErrors;
  onHost: (value: string) => void;
  onPort: (value: number) => void;
  onSecurity: (value: MailSecurity) => void;
}) {
  return (
    <fieldset className="grid gap-3 rounded-[10px] border border-line p-3 sm:grid-cols-[minmax(0,1fr)_96px_150px]">
      <legend className="px-1 text-[11px] font-semibold text-ink">{label}</legend>
      <Field label="Server" htmlFor={`${prefix}-host`} error={errors[`${prefix}Host`]}>
        <input id={`${prefix}-host`} className="input" value={host} onChange={(event) => onHost(event.target.value)} placeholder="mxXXX.netcup.net" />
      </Field>
      <Field label="Port" htmlFor={`${prefix}-port`} error={errors[`${prefix}Port`]}>
        <input
          id={`${prefix}-port`}
          type="number"
          min={1}
          max={65535}
          className="input"
          value={port}
          onChange={(event) => onPort(Number(event.target.value))}
        />
      </Field>
      <Field label="Verschlüsselung" htmlFor={`${prefix}-security`} error={errors[`${prefix}Security`]}>
        <select
          id={`${prefix}-security`}
          className="select"
          value={security}
          onChange={(event) => onSecurity(event.target.value as MailSecurity)}
        >
          <option value="ssl">SSL/TLS</option>
          <option value="starttls">STARTTLS</option>
        </select>
      </Field>
    </fieldset>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-[12px] font-medium text-ink">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
      {label}
    </label>
  );
}
