"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { acceptInvitationAction, invitationAction } from "@/app/actions";
import type { InvitationInfo } from "@/lib/types";
import { FormError } from "@/components/ui/field";
import { IconCheck, IconLoader } from "@/components/ui/icons";

/**
 * The token sits after "#" in the link, so it never reaches a server log; it is read here
 * and only sent in the request body.
 */
export function AcceptInvitation() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [info, setInfo] = useState<InvitationInfo | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const timer = setTimeout(async () => {
      const value = window.location.hash.replace(/^#/, "").trim();
      if (!value) {
        setProblem("Der Link ist unvollständig. Bitte den kompletten Link aus der Einladung öffnen.");
        return;
      }
      setToken(value);
      const result = await invitationAction(value);
      if (result.ok) setInfo(result.info);
      else setProblem(result.error);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (password !== repeat) {
      setError("Die beiden Passwörter stimmen nicht überein.");
      return;
    }
    startTransition(async () => {
      const result = await acceptInvitationAction(token!, password);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      // Remove the used token from the address bar and history.
      window.history.replaceState(null, "", "/einladung");
      router.push("/login?eingerichtet=1");
    });
  }

  if (problem) {
    return (
      <div className="mt-5 rounded-[8px] border border-amber-200 bg-amber-50 px-3 py-2.5 text-[12px] leading-relaxed text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
        {problem} Bitte einen Inhaber um einen neuen Link.
      </div>
    );
  }

  if (!info) {
    return (
      <p className="mt-5 flex items-center gap-2 text-[12px] text-muted">
        <IconLoader className="h-3.5 w-3.5" />
        Einladung wird geprüft …
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
      <p className="text-[12.5px] leading-relaxed text-ink">
        Hallo {info.displayName}, lege jetzt dein Passwort für <strong>{info.email}</strong> fest.
      </p>
      <FormError message={error} />
      <input type="email" autoComplete="username" value={info.email} readOnly hidden />
      <label className="flex flex-col gap-1">
        <span className="label">Neues Passwort</span>
        <input className="input" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </label>
      <label className="flex flex-col gap-1">
        <span className="label">Passwort wiederholen</span>
        <input className="input" type="password" autoComplete="new-password" value={repeat} onChange={(e) => setRepeat(e.target.value)} required />
      </label>
      <p className="text-[10.5px] text-subtle">Mindestens 12 Zeichen, mit drei von vier: Großbuchstaben, Kleinbuchstaben, Zahl, Sonderzeichen.</p>
      <button type="submit" className="btn btn-primary h-10" disabled={pending || !password || !repeat}>
        {pending ? <IconLoader className="h-3.5 w-3.5" /> : <IconCheck className="h-3.5 w-3.5" />}
        Passwort festlegen
      </button>
    </form>
  );
}
