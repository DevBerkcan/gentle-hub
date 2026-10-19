"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { IconAlert, IconArrowRight, IconRefresh } from "@/components/ui/icons";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-[24px] border border-line bg-surface p-7 text-center shadow-float">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-[14px] bg-rose-50 text-rose-600">
            <IconAlert className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-display text-[22px] font-extrabold tracking-[-0.03em] text-ink">
            Etwas ist schiefgelaufen
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            Die Anfrage konnte nicht abgeschlossen werden. PrÃ¼fe kurz die Verbindung und versuche
            es erneut.
          </p>
          {error.digest && (
            <p className="mt-3 rounded-[8px] bg-surface-2 px-2 py-1 font-mono text-[10px] text-subtle">
              Fehler-ID: {error.digest}
            </p>
          )}
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button type="button" onClick={reset} className="btn btn-primary">
              <IconRefresh className="h-4 w-4" />
              Erneut versuchen
            </button>
            <Link href="/" className="btn btn-secondary">
              Zum Dashboard
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
