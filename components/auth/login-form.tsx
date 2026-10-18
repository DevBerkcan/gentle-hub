"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { buttonClass, inputClass } from "@/components/hub/application-form";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setState("sending");
    setError(null);
    const { error } = await authClient.signIn.magicLink({
      email: email.trim(),
      callbackURL: "/",
      errorCallbackURL: "/login",
    });
    if (error) {
      setState("error");
      setError(
        error.status === 429
          ? "Zu viele Versuche. Bitte warte kurz und versuche es erneut."
          : "Der Link konnte nicht versendet werden. Bitte versuche es später erneut."
      );
      return;
    }
    setState("sent");
  }

  if (state === "sent") {
    return (
      <div role="status" className="mt-6 rounded-control border border-line bg-surface-muted/60 px-4 py-3 text-sm text-fg">
        <p className="font-medium">Schau in dein Postfach.</p>
        <p className="mt-1 text-fg-muted">
          Falls <strong>{email.trim()}</strong> freigegeben ist, ist ein Anmeldelink unterwegs. Er ist 10 Minuten gültig.
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="focus-ring mt-3 rounded text-xs font-medium text-fg-muted underline-offset-2 hover:text-fg hover:underline"
        >
          Andere Adresse verwenden
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
      <label htmlFor="email" className="text-[13px] font-medium text-fg">
        E-Mail-Adresse
      </label>
      <input
        id="email"
        type="email"
        required
        autoComplete="email"
        autoFocus
        placeholder="name@gentlegroup.de"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className={inputClass}
      />
      <button type="submit" disabled={state === "sending" || !email.trim()} className={`${buttonClass.primary} h-10`}>
        {state === "sending" ? "Wird gesendet…" : "Anmeldelink senden"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
