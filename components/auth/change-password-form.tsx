"use client";

import { useState, useTransition } from "react";
import { changePasswordAction } from "@/app/actions";
import type { FieldErrors } from "@/lib/action-types";
import { cn } from "@/lib/cn";
import { Field, FormError, SuccessNote } from "@/components/ui/field";
import { IconCheck, IconEye, IconEyeOff, IconLoader, IconShield } from "@/components/ui/icons";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, startTransition] = useTransition();

  const checks = [
    newPassword.length >= 12,
    /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword),
    /\d/.test(newPassword),
    /[^a-zA-Z0-9]/.test(newPassword),
  ];
  const strength = checks.filter(Boolean).length;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const nextErrors: FieldErrors = {};
    if (!currentPassword) nextErrors.currentPassword = "Bitte das aktuelle Passwort eingeben.";
    if (newPassword.length < 12) nextErrors.newPassword = "Mindestens 12 Zeichen.";
    if (newPassword !== confirmPassword) nextErrors.confirmPassword = "Die Passwörter stimmen nicht überein.";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    startTransition(async () => {
      const result = await changePasswordAction({ currentPassword, newPassword });
      if (!result.ok) {
        setErrors(result.errors ?? {});
        setError(result.error);
        return;
      }

      setSuccess(result.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <FormError message={error} />
      <SuccessNote message={success} />

      <Field
        label="Aktuelles Passwort"
        htmlFor="current-password"
        error={errors.currentPassword}
        required
      >
        <input
          id="current-password"
          type="password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          className="input"
          autoComplete="current-password"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Neues Passwort"
          htmlFor="new-password"
          error={errors.newPassword}
          hint="Mindestens 12 Zeichen."
          required
        >
          <div className="relative">
            <input
              id="new-password"
              type={show ? "text" : "password"}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="input pr-11"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShow((current) => !current)}
              aria-label={show ? "Passwort verbergen" : "Passwort anzeigen"}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-[8px] text-subtle transition hover:bg-[#f0edf6] hover:text-ink"
            >
              {show ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        <Field
          label="Neues Passwort wiederholen"
          htmlFor="confirm-password"
          error={errors.confirmPassword}
          required
        >
          <input
            id="confirm-password"
            type={show ? "text" : "password"}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="input"
            autoComplete="new-password"
          />
        </Field>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {[0, 1, 2, 3].map((index) => (
            <span
              key={index}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                strength > index
                  ? strength <= 2
                    ? "bg-amber-400"
                    : "bg-emerald-500"
                  : "bg-line",
              )}
            />
          ))}
        </div>
        <span className="w-16 text-right text-[10px] font-semibold text-muted">
          {newPassword.length === 0 ? "" : strength <= 2 ? "Schwach" : strength === 3 ? "Gut" : "Stark"}
        </span>
      </div>

      <ul className="grid gap-1 text-[11px] text-muted sm:grid-cols-2">
        {[
          { ok: checks[0], label: "Mindestens 12 Zeichen" },
          { ok: checks[1], label: "Groß- und Kleinbuchstaben" },
          { ok: checks[2], label: "Mindestens eine Zahl" },
          { ok: checks[3], label: "Ein Sonderzeichen" },
        ].map((item) => (
          <li key={item.label} className="flex items-center gap-1.5">
            <span
              className={cn(
                "flex h-3.5 w-3.5 items-center justify-center rounded-full",
                item.ok ? "bg-emerald-100 text-emerald-700" : "bg-[#f0edf6] text-subtle",
              )}
            >
              <IconCheck className="h-2.5 w-2.5" />
            </span>
            {item.label}
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
        <p className="inline-flex items-center gap-1.5 text-[11px] text-muted">
          <IconShield className="h-3.5 w-3.5" />
          Andere Geräte werden abgemeldet.
        </p>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending && <IconLoader className="h-4 w-4" />}
          {pending ? "Speichert …" : "Passwort ändern"}
        </button>
      </div>
    </form>
  );
}
