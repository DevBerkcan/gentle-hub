"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <h1 className="text-lg font-semibold text-fg">Etwas ist schiefgelaufen</h1>
      <p className="mt-1.5 max-w-sm text-sm text-fg-muted">
        Die Daten konnten nicht geladen werden. Bitte versuche es erneut.
      </p>
      <button
        type="button"
        onClick={reset}
        className="focus-ring mt-5 h-9 rounded-control bg-fg px-3.5 text-sm font-medium text-bg hover:opacity-90"
      >
        Erneut versuchen
      </button>
    </main>
  );
}
