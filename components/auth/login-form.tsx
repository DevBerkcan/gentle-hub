"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { loginAction } from "@/app/actions";
import { cn } from "@/lib/cn";
import {
  IconEye,
  IconEyeOff,
  IconLoader,
  IconLockCheck,
  IconMail,
  IconWifiOff,
} from "@/components/ui/icons";
import { FormError } from "@/components/ui/field";

export function LoginForm({ backendOnline = true }: { backendOnline?: boolean }) {
  const [state, formAction, pending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!state?.error) return;
    if (passwordRef.current) {
      passwordRef.current.value = "";
      passwordRef.current.focus();
    }
  }, [state]);

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      <FormError message={state?.error} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="label">
          E-Mail-Adresse
        </label>
        <div className="relative">
          <IconMail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            autoFocus
            placeholder="name@gentlegroup.de"
            className="input pl-10"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="label">
          Passwort
        </label>
        <div className="relative">
          <input
            ref={passwordRef}
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="••••••••••••"
            className="input pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-[8px] text-subtle transition hover:bg-surface-2 hover:text-ink"
          >
            {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button type="submit" disabled={pending} className="btn btn-primary btn-lg mt-1 w-full">
        {pending ? <IconLoader className="h-4 w-4" /> : <IconLockCheck className="h-4 w-4" />}
        {pending ? "Anmelden …" : "Anmelden"}
      </button>

      <div
        className={cn(
          "flex items-center justify-center gap-1.5 rounded-[9px] px-2 py-1.5 text-[10.5px] font-medium",
          backendOnline ? "bg-emerald-50/70 text-emerald-700" : "bg-amber-50 text-amber-800",
        )}
        role="status"
      >
        {backendOnline ? (
          <>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
            Backend verbunden
          </>
        ) : (
          <>
            <IconWifiOff className="h-3 w-3" />
            Backend nicht erreichbar – Anmeldung eventuell nicht möglich
          </>
        )}
      </div>
    </form>
  );
}
