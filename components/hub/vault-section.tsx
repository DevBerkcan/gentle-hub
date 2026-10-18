"use client";

import { useEffect, useState } from "react";
import type { VaultController } from "@/lib/use-vault";
import type { VaultEntry } from "@/lib/vault";
import { Field, buttonClass, inputClass } from "@/components/hub/application-form";
import { IconCopy, IconEye, IconEyeOff, IconLock } from "@/components/ui/icons";

const MIN_MASTER_LENGTH = 10;
const CLIPBOARD_CLEAR_MS = 30_000;

/** Copies a value and clears the clipboard after 30 s if it still holds that value. */
async function copySecret(value: string): Promise<void> {
  await navigator.clipboard.writeText(value);
  window.setTimeout(async () => {
    try {
      if ((await navigator.clipboard.readText()) === value) await navigator.clipboard.writeText("");
    } catch {
      // Reading the clipboard may be denied — then we leave it alone.
    }
  }, CLIPBOARD_CLEAR_MS);
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      disabled={!value}
      onClick={async () => {
        await copySecret(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
      aria-label={label}
      title={copied ? "Kopiert" : label}
      className="focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-control border border-line bg-surface text-fg-muted shadow-card hover:text-fg disabled:opacity-40"
    >
      {copied ? <span className="text-[11px] font-medium text-accent-fg">✓</span> : <IconCopy />}
    </button>
  );
}

function MasterPasswordForm({ vault, mode }: { vault: VaultController; mode: "setup" | "unlock" }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (mode === "setup") {
      if (password.length < MIN_MASTER_LENGTH) return setLocalError(`Mindestens ${MIN_MASTER_LENGTH} Zeichen.`);
      if (password !== confirm) return setLocalError("Die Passwörter stimmen nicht überein.");
      setLocalError(null);
      await vault.setup(password);
    } else {
      setLocalError(null);
      if (await vault.unlock(password)) setPassword("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {mode === "setup" ? (
        <p className="text-sm text-fg-muted">
          Zugangsdaten werden in eurem Browser mit einem gemeinsamen <strong>Master-Passwort</strong> verschlüsselt.
          Server und Datenbank sehen nur verschlüsselte Daten. Teilt das Master-Passwort persönlich mit eurem Partner –
          es kann <strong>nicht wiederhergestellt</strong> werden.
        </p>
      ) : (
        <p className="text-sm text-fg-muted">Der Tresor ist gesperrt. Mit dem Master-Passwort entsperren.</p>
      )}
      <Field label="Master-Passwort" error={localError ?? vault.error ?? undefined}>
        {(props) => (
          <input
            {...props}
            type="password"
            autoComplete={mode === "setup" ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClass}
          />
        )}
      </Field>
      {mode === "setup" && (
        <Field label="Master-Passwort wiederholen">
          {(props) => (
            <input
              {...props}
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              className={inputClass}
            />
          )}
        </Field>
      )}
      <div>
        <button type="submit" disabled={vault.busy || !password} className={buttonClass.primary}>
          <IconLock className="h-3.5 w-3.5" />
          {vault.busy ? "Bitte warten…" : mode === "setup" ? "Tresor einrichten" : "Entsperren"}
        </button>
      </div>
    </form>
  );
}

function EntryForm({ vault, applicationId }: { vault: VaultController; applicationId: string }) {
  const stored = vault.entries[applicationId];
  const [entry, setEntry] = useState<VaultEntry>(() => ({ ...stored }));
  const [reveal, setReveal] = useState(false);
  const [saved, setSaved] = useState(false);
  const isDirty =
    (entry.username ?? "") !== (stored?.username ?? "") ||
    (entry.password ?? "") !== (stored?.password ?? "") ||
    (entry.hint ?? "") !== (stored?.hint ?? "");

  useEffect(() => {
    if (!saved) return;
    const timer = window.setTimeout(() => setSaved(false), 2000);
    return () => window.clearTimeout(timer);
  }, [saved]);

  function set(key: keyof VaultEntry, value: string) {
    setEntry((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (await vault.saveEntry(applicationId, entry)) setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Field label="Benutzer / E-Mail">
        {(props) => (
          <div className="flex gap-2">
            <input
              {...props}
              autoComplete="off"
              spellCheck={false}
              value={entry.username ?? ""}
              onChange={(event) => set("username", event.target.value)}
              className={inputClass}
            />
            <CopyButton value={entry.username ?? ""} label="Benutzer kopieren" />
          </div>
        )}
      </Field>
      <Field label="Passwort">
        {(props) => (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                {...props}
                type={reveal ? "text" : "password"}
                autoComplete="new-password"
                spellCheck={false}
                value={entry.password ?? ""}
                onChange={(event) => set("password", event.target.value)}
                className={`${inputClass} pr-10 font-mono`}
              />
              <button
                type="button"
                onClick={() => setReveal((current) => !current)}
                aria-label={reveal ? "Passwort verbergen" : "Passwort anzeigen"}
                aria-pressed={reveal}
                className="focus-ring absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-md text-fg-subtle hover:text-fg"
              >
                {reveal ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
            <CopyButton value={entry.password ?? ""} label="Passwort kopieren" />
          </div>
        )}
      </Field>
      <Field label="Hinweis (verschlüsselt)">
        {(props) => (
          <textarea
            {...props}
            rows={2}
            value={entry.hint ?? ""}
            onChange={(event) => set("hint", event.target.value)}
            className={`${inputClass} h-auto py-2`}
          />
        )}
      </Field>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={!isDirty || vault.busy} className={buttonClass.primary}>
          {vault.busy ? "Verschlüsselt…" : "Zugangsdaten speichern"}
        </button>
        <p className="text-xs" role="status" aria-live="polite">
          {saved && <span className="text-fg-subtle">Verschlüsselt gespeichert</span>}
          {vault.error && <span className="text-red-600">{vault.error}</span>}
        </p>
      </div>
    </form>
  );
}

export function VaultSection({ vault, applicationId }: { vault: VaultController; applicationId: string }) {
  if (vault.status === "none") return <MasterPasswordForm vault={vault} mode="setup" />;
  if (vault.status === "locked") return <MasterPasswordForm vault={vault} mode="unlock" />;
  return (
    <div className="flex flex-col gap-3">
      <EntryForm key={applicationId} vault={vault} applicationId={applicationId} />
      <button
        type="button"
        onClick={vault.lock}
        className="focus-ring self-start rounded text-xs font-medium text-fg-muted underline-offset-2 hover:text-fg hover:underline"
      >
        Tresor sperren
      </button>
    </div>
  );
}
