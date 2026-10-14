export function EmptyState({ onReset }: { onReset?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-line-strong px-6 py-16 text-center">
      <p className="text-base font-semibold text-fg">Keine Anwendung gefunden</p>
      <p className="mt-1.5 max-w-sm text-sm text-fg-muted">
        Versuche einen anderen Suchbegriff oder wähle eine andere Kategorie.
      </p>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="focus-ring mt-5 h-9 rounded-control border border-line bg-surface px-3.5 text-sm font-medium text-fg shadow-card transition-colors duration-[var(--duration-fast)] hover:border-line-strong"
        >
          Filter zurücksetzen
        </button>
      )}
    </div>
  );
}
