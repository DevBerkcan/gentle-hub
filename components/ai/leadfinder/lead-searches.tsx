"use client";

import { useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { restartLeadEnrichmentAction } from "@/app/actions";
import { cn } from "@/lib/cn";
import type { LeadSearch, PlacesUsage } from "@/lib/types";
import { IconLoader, IconRefresh } from "@/components/ui/icons";

const STATUS: Record<LeadSearch["status"], string> = {
  queued: "wartet",
  running: "läuft",
  done: "fertig",
  failed: "abgebrochen",
};

const USAGE_LABELS: Record<PlacesUsage["sku"], string> = {
  "search-ids": "Suchanfragen (kostenlos)",
  "search-pro": "Ortssuche",
  "details-pro": "Anzeige in der Liste",
  "details-enterprise": "Lead-Details (Website, Telefon)",
};

/** Recent searches with live progress; refreshes itself while one is running or leads are being enriched. */
export function LeadSearches({
  searches,
  usage,
  pendingEnrichment,
  activeSearchId,
}: {
  searches: LeadSearch[];
  usage: PlacesUsage[];
  pendingEnrichment: number;
  activeSearchId?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const busy = searches.some((s) => s.status === "queued" || s.status === "running");

  useEffect(() => {
    if (!busy && pendingEnrichment === 0) return;
    const timer = setInterval(() => router.refresh(), 6000);
    return () => clearInterval(timer);
  }, [busy, pendingEnrichment, router]);

  const enterprise = usage.find((u) => u.sku === "details-enterprise");
  const capped = enterprise ? enterprise.calls >= enterprise.cap : false;

  return (
    <section className="card flex flex-col gap-3 p-5" aria-labelledby="searches-heading">
      <div className="flex items-center gap-2">
        <h2 id="searches-heading" className="flex-1 text-[13px] font-semibold text-ink">
          Suchen
        </h2>
        {pendingEnrichment > 0 && (
          <span className="flex items-center gap-1.5 text-[11px] text-muted">
            {!capped && <IconLoader className="h-3 w-3" />}
            {pendingEnrichment} Lead{pendingEnrichment === 1 ? "" : "s"} {capped ? "warten auf das nächste Monatskontingent" : "werden angereichert"}
          </span>
        )}
        {capped && (
          <button
            type="button"
            className="btn btn-ghost h-7 px-2 text-[11px]"
            disabled={pending}
            onClick={() => startTransition(async () => { await restartLeadEnrichmentAction(); router.refresh(); })}
          >
            <IconRefresh className="h-3 w-3" />
            Erneut versuchen
          </button>
        )}
      </div>

      {searches.length === 0 ? (
        <p className="text-[12px] text-muted">Noch keine Suche gestartet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line">
          {searches.map((search) => {
            const progress = search.tilesTotal > 0 ? Math.round((100 * search.tilesDone) / search.tilesTotal) : 0;
            return (
              <li key={search.id} className="flex flex-col gap-1 py-2.5">
                <div className="flex flex-wrap items-baseline gap-x-2 text-[12.5px]">
                  <Link
                    href={activeSearchId === search.id ? "/ai/leads" : `/ai/leads?search=${search.id}`}
                    className={cn("font-semibold text-ink hover:underline", activeSearchId === search.id && "underline")}
                  >
                    {search.categories.join(", ")}
                  </Link>
                  <span className="text-muted">
                    {search.radiusKm} km um {search.location}
                  </span>
                  <span
                    className={cn(
                      "ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      search.status === "done" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200",
                      search.status === "failed" && "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200",
                      (search.status === "running" || search.status === "queued") && "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200",
                    )}
                  >
                    {STATUS[search.status]}
                  </span>
                </div>
                <p className="text-[11px] text-muted">
                  {search.placesFound} gefunden · {search.newLeads} neu
                  {search.status === "running" && search.tilesTotal > 0 && ` · ${progress} % des Gebiets abgesucht`}
                </p>
                {search.status === "running" && (
                  <div className="h-1 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full bg-amber-400 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                )}
                {search.lastError && <p className="text-[11px] text-rose-600">{search.lastError}</p>}
              </li>
            );
          })}
        </ul>
      )}

      <details className="text-[11px] text-muted">
        <summary className="cursor-pointer">Google-Kontingent diesen Monat</summary>
        <ul className="mt-2 flex flex-col gap-1.5">
          {usage.map((u) => (
            <li key={u.sku} className="flex flex-col gap-0.5">
              <span className="flex justify-between">
                <span>{USAGE_LABELS[u.sku]}</span>
                <span className="tabular-nums">
                  {u.calls.toLocaleString("de-DE")} / {u.cap.toLocaleString("de-DE")}
                </span>
              </span>
              <span className="h-1 overflow-hidden rounded-full bg-surface-2">
                <span className="block h-full bg-amber-400" style={{ width: `${Math.min(100, (100 * u.calls) / Math.max(1, u.cap))}%` }} />
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-2 leading-relaxed">Die Grenzen liegen unter Googles freiem Monatskontingent. Ist eine erreicht, ruft Arda nichts mehr ab.</p>
      </details>
    </section>
  );
}
