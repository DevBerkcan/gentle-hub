import { cn } from "@/lib/cn";
import type { DraftReview } from "@/lib/types";
import { AgentAvatar } from "@/components/ai/agent-avatar";

const TYPE_LABELS: Record<string, string> = {
  tone: "Ton",
  fact: "Fakten",
  price: "Preis",
  missing: "Fehlt",
  spelling: "Rechtschreibung",
  privacy: "Datenschutz",
  other: "Hinweis",
};

/** Ece's verdict on the draft. Advisory: it never blocks sending. */
export function DraftReviewBox({ review, version }: { review?: DraftReview | null; version: number }) {
  const stale = review && review.draftVersion !== version;
  const ok = review?.verdict === "ok" && !stale;

  return (
    <section
      className={cn(
        "flex items-start gap-3 rounded-[12px] border p-3",
        !review || stale
          ? "border-line bg-surface-2/60"
          : ok
            ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/30 dark:bg-emerald-500/10"
            : "border-amber-200 bg-amber-50/80 dark:border-amber-500/30 dark:bg-amber-500/10",
      )}
      aria-label="Qualitätsprüfung"
    >
      <AgentAvatar agentId="draft-review" size={40} state={!review || stale ? "working" : "idle"} title="Ece · Qualitätsprüfung" />
      <div className="min-w-0 flex-1 text-[12px]">
        <p className="font-semibold text-ink">
          {!review
            ? "Ece prüft den Entwurf …"
            : stale
              ? "Ece prüft die geänderte Fassung …"
              : ok
                ? `Ece: passt so${review.score ? ` (${review.score}/10)` : ""}`
                : `Ece: bitte kurz prüfen${review.score ? ` (${review.score}/10)` : ""}`}
        </p>
        {review && !stale && review.findings.length > 0 && (
          <ul className="mt-1 flex flex-col gap-0.5 text-[11.5px] leading-relaxed text-ink">
            {review.findings.map((finding, index) => (
              <li key={index}>
                <span className="mr-1.5 rounded-[4px] bg-white/70 px-1 py-px text-[9.5px] font-semibold uppercase tracking-wide text-muted dark:bg-white/10">
                  {TYPE_LABELS[finding.type ?? "other"] ?? "Hinweis"}
                </span>
                {finding.text}
              </li>
            ))}
          </ul>
        )}
        {!review && <p className="text-[11px] text-muted">Das Ergebnis erscheint nach dem Neuladen der Seite (meist unter einer Minute).</p>}
      </div>
    </section>
  );
}
