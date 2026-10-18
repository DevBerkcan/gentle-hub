"use client";

import { useEffect, useRef, useState } from "react";
import type { Application, ApplicationInput } from "@/types";
import { CATEGORY_LABELS } from "@/data/applications";
import {
  createApplicationAction,
  deleteApplicationAction,
  updateApplicationAction,
  updateNotesAction,
} from "@/app/actions";
import type { VaultController } from "@/lib/use-vault";
import { displayNameFromEmail } from "@/lib/allowlist";
import { LIMITS } from "@/lib/validation";
import { formatRelativeTime, isValidExternalUrl } from "@/lib/utils";
import { ApplicationForm, buttonClass, inputClass } from "@/components/hub/application-form";
import { VaultSection } from "@/components/hub/vault-section";
import { AppIcon } from "@/components/ui/app-icon";
import { EnvironmentBadge } from "@/components/ui/environment-badge";
import { IconArrow } from "@/components/ui/icon-arrow";
import { IconClose, IconCopy } from "@/components/ui/icons";

export type DialogState = { mode: "create" } | { mode: "view"; id: string };

type ApplicationDialogProps = {
  state: DialogState;
  application?: Application;
  vault: VaultController;
  onClose: () => void;
  onCreated: (id: string) => void;
  onOpen: (id: string) => void;
};

const NOTES_DEBOUNCE_MS = 800;

function Section({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-line px-5 py-5 sm:px-6">
      <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-fg-subtle">{title}</h3>
      {children}
    </section>
  );
}

function toInput(application: Application): ApplicationInput {
  const { name, description, url, icon, category, environment } = application;
  return { name, description, url, icon, category, environment };
}

/** Shared notes with debounced auto-save. Pending changes are flushed on close. */
function NotesEditor({ application }: { application: Application }) {
  const [value, setValue] = useState(application.notes ?? "");
  const [status, setStatus] = useState<"idle" | "pending" | "saving" | "saved" | "error">("idle");
  const pending = useRef<string | null>(null);

  async function flush() {
    if (pending.current === null) return;
    const notes = pending.current;
    pending.current = null;
    setStatus("saving");
    const result = await updateNotesAction(application.id, notes);
    setStatus(result.ok ? "saved" : "error");
  }

  useEffect(() => {
    if (status !== "pending") return;
    const timer = window.setTimeout(flush, NOTES_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- flush reads the latest value via ref
  }, [value, status]);

  // Save unsaved notes when the dialog closes.
  useEffect(
    () => () => {
      if (pending.current !== null) void updateNotesAction(application.id, pending.current);
    },
    [application.id]
  );

  const meta =
    application.updatedAt && application.updatedBy && status === "idle"
      ? `Zuletzt geändert von ${displayNameFromEmail(application.updatedBy)} · ${formatRelativeTime(application.updatedAt)}`
      : null;

  return (
    <div className="flex flex-col gap-2">
      <textarea
        aria-label={`Notizen zu ${application.name}`}
        rows={6}
        maxLength={LIMITS.notes}
        placeholder="Ideen, Hinweise, Ansprechpartner … (Passwörter bitte unten im Tresor)"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          pending.current = event.target.value;
          setStatus("pending");
        }}
        onBlur={flush}
        className={`${inputClass} h-auto min-h-32 resize-y py-2.5 leading-relaxed`}
      />
      <p className="text-xs text-fg-subtle" role="status" aria-live="polite">
        {status === "pending" && "Ungespeicherte Änderungen…"}
        {status === "saving" && "Speichert…"}
        {status === "saved" && "Gespeichert"}
        {status === "error" && <span className="text-red-600">Speichern fehlgeschlagen</span>}
        {meta}
      </p>
    </div>
  );
}

function DeleteZone({ application, vault, onDeleted }: { application: Application; vault: VaultController; onDeleted: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const result = await deleteApplicationAction(application.id);
    if (!result.ok) return setError(result.error);
    if (vault.status === "unlocked") await vault.saveEntry(application.id, null);
    onDeleted();
  }

  return confirming ? (
    <div className="flex flex-col gap-3 rounded-control border border-red-200 bg-red-50 p-3">
      <p className="text-sm text-red-900">
        „{application.name}“ mit Link, Notizen und Favoriten endgültig löschen?
      </p>
      <div className="flex gap-2">
        <button type="button" onClick={handleDelete} className={buttonClass.danger}>
          Endgültig löschen
        </button>
        <button type="button" onClick={() => setConfirming(false)} className={buttonClass.secondary}>
          Abbrechen
        </button>
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  ) : (
    <button type="button" onClick={() => setConfirming(true)} className={`${buttonClass.secondary} text-red-600`}>
      Anwendung löschen
    </button>
  );
}

function LinkActions({
  application,
  onOpen,
  onEditLink,
}: {
  application: Application;
  onOpen: (id: string) => void;
  onEditLink: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const valid = isValidExternalUrl(application.url);
  return (
    <div className="flex flex-wrap items-center gap-2">
      {valid && (
        <a
          href={application.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onOpen(application.id)}
          className={buttonClass.primary}
        >
          Öffnen
          <IconArrow className="h-3.5 w-3.5" />
        </a>
      )}
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(application.url);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        }}
        className={buttonClass.secondary}
      >
        <IconCopy className="h-3.5 w-3.5" />
        {copied ? "Kopiert" : "Link kopieren"}
      </button>
      <button type="button" onClick={onEditLink} className={buttonClass.secondary}>
        Link ändern
      </button>
      <span className="min-w-0 basis-full truncate text-xs text-fg-subtle" title={application.url}>
        {application.url}
      </span>
    </div>
  );
}

/** Side sheet (full screen on mobile) built on the native <dialog>: focus trap and Esc for free. */
export function ApplicationDialog({ state, application, vault, onClose, onCreated, onOpen }: ApplicationDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const isCreate = state.mode === "create";
  const title = isCreate ? "Neue Anwendung" : (application?.name ?? "Anwendung");

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) ref.current?.close();
      }}
      className="sheet w-full overflow-y-auto border-l border-line bg-bg p-0 text-fg shadow-popover sm:w-[30rem]"
    >
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-bg/90 px-5 py-4 backdrop-blur sm:px-6">
        {application && !isCreate && <AppIcon application={application} />}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold tracking-tight">{title}</h2>
          {application && !isCreate && (
            <p className="flex items-center gap-2 text-xs text-fg-subtle">
              {CATEGORY_LABELS[application.category]}
              <EnvironmentBadge environment={application.environment} />
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => ref.current?.close()}
          aria-label="Schließen"
          className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg text-fg-muted hover:bg-surface-muted hover:text-fg"
        >
          <IconClose />
        </button>
      </div>

      {isCreate ? (
        <div className="px-5 py-5 sm:px-6">
          <ApplicationForm
            submitLabel="Anwendung anlegen"
            onSubmit={async (input) => {
              const result = await createApplicationAction(input);
              if (result.ok) onCreated(result.id);
              return result;
            }}
          />
        </div>
      ) : application ? (
        <>
          <div className="px-5 py-5 sm:px-6">
            {application.description && <p className="mb-4 text-sm text-fg-muted">{application.description}</p>}
            <LinkActions
              application={application}
              onOpen={onOpen}
              onEditLink={() => {
                const field = ref.current?.querySelector<HTMLInputElement>("#edit-details input");
                field?.scrollIntoView({ block: "center", behavior: "smooth" });
                field?.focus({ preventScroll: true });
                field?.select();
              }}
            />
          </div>
          <Section title="Notizen">
            <NotesEditor key={application.id} application={application} />
          </Section>
          <Section title="Zugangsdaten">
            <VaultSection vault={vault} applicationId={application.id} />
          </Section>
          <Section id="edit-details" title="Link & Details bearbeiten">
            <ApplicationForm
              key={application.id}
              initial={toInput(application)}
              submitLabel="Änderungen speichern"
              onSubmit={(input) => updateApplicationAction(application.id, input)}
            />
          </Section>
          <Section title="Löschen">
            <DeleteZone application={application} vault={vault} onDeleted={() => ref.current?.close()} />
          </Section>
        </>
      ) : (
        <p className="px-6 py-10 text-sm text-fg-muted">Diese Anwendung existiert nicht mehr.</p>
      )}
    </dialog>
  );
}
