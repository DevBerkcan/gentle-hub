"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { buttonClass, inputClass } from "@/components/hub/application-form";

/**
 * Uncontrolled on purpose: values are read from the form on submit, so
 * password-manager autofill (which can happen before hydration) always works.
 */
export function LoginForm() {
  const router = useRouter();
  const passwordRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    if (!email || !password) return setError("Bitte E-Mail-Adresse und Passwort eingeben.");

    setPending(true);
    setError(null);
    const { error } = await authClient.signIn.email({ email, password, rememberMe: true });
    if (error) {
      setPending(false);
      if (passwordRef.current) passwordRef.current.value = "";
      passwordRef.current?.focus();
      setError(
        error.status === 429
          ? "Zu viele Versuche. Bitte warte eine Minute."
          : "E-Mail-Adresse oder Passwort ist falsch."
      );
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-[13px] font-medium text-fg">
          E-Mail-Adresse
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          autoFocus
          placeholder="name@gentlegroup.de"
          className={inputClass}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-[13px] font-medium text-fg">
          Passwort
        </label>
        <input
          ref={passwordRef}
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </div>
      <button type="submit" disabled={pending} className={`${buttonClass.primary} h-10`}>
        {pending ? "Anmelden…" : "Anmelden"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
