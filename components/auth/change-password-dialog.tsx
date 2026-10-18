"use client";

import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { checkPassword } from "@/lib/password-policy";
import { Field, buttonClass, inputClass } from "@/components/hub/application-form";
import { IconClose } from "@/components/ui/icons";

/** Changes the account password. Other sessions are signed out afterwards. */
export function ChangePasswordDialog({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "saving" | "done">("idle");

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const policyError = checkPassword(next);
    if (policyError) return setError(policyError);
    if (next !== repeat) return setError("Die neuen Passwörter stimmen nicht überein.");

    setState("saving");
    setError(null);
    const { error } = await authClient.changePassword({
      currentPassword: current,
      newPassword: next,
      revokeOtherSessions: true,
    });
    if (error) {
      setState("idle");
      setError(error.status === 429 ? "Zu viele Versuche. Bitte warte eine Minute." : "Das aktuelle Passwort ist falsch.");
      return;
    }
    setState("done");
  }

  return (
    <dialog
      ref={ref}
      aria-label="Passwort ändern"
      onClose={onClose}
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-card border border-line bg-surface p-0 text-fg shadow-popover backdrop:bg-overlay"
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 className="text-base font-semibold tracking-tight">Passwort ändern</h2>
        <button
          type="button"
          onClick={() => ref.current?.close()}
          aria-label="Schließen"
          className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-fg-muted hover:bg-surface-muted hover:text-fg"
        >
          <IconClose />
        </button>
      </div>
      {state === "done" ? (
        <div className="flex flex-col gap-4 px-5 py-5">
          <p role="status" className="text-sm text-fg">
            Passwort geändert. Andere Geräte wurden abgemeldet.
          </p>
          <button type="button" onClick={() => ref.current?.close()} className={`${buttonClass.primary} self-start`}>
            Fertig
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-5">
          <Field label="Aktuelles Passwort">
            {(props) => (
              <input
                {...props}
                type="password"
                autoComplete="current-password"
                value={current}
                onChange={(event) => setCurrent(event.target.value)}
                className={inputClass}
              />
            )}
          </Field>
          <Field label="Neues Passwort" hint="Mindestens 12 Zeichen.">
            {(props) => (
              <input
                {...props}
                type="password"
                autoComplete="new-password"
                value={next}
                onChange={(event) => setNext(event.target.value)}
                className={inputClass}
              />
            )}
          </Field>
          <Field label="Neues Passwort wiederholen" error={error ?? undefined}>
            {(props) => (
              <input
                {...props}
                type="password"
                autoComplete="new-password"
                value={repeat}
                onChange={(event) => setRepeat(event.target.value)}
                className={inputClass}
              />
            )}
          </Field>
          <button
            type="submit"
            disabled={state === "saving" || !current || !next || !repeat}
            className={`${buttonClass.primary} self-start`}
          >
            {state === "saving" ? "Speichert…" : "Passwort ändern"}
          </button>
        </form>
      )}
    </dialog>
  );
}
