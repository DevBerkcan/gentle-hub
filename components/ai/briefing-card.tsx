"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { briefingNowAction } from "@/app/actions";
import { formatEur } from "@/lib/ai-format";
import type { Briefing } from "@/lib/types";
import { AgentAvatar } from "@/components/ai/agent-avatar";
import { IconArrowRight, IconLoader, IconRefresh } from "@/components/ui/icons";

function dayLabel(day: string) {
  return new Date(`${day}T12:00:00Z`).toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "2-digit", timeZone: "UTC" });
}

/** Leyla's morning briefing: headline, top priorities with links, yesterday's numbers. */
export function BriefingCard({ briefing, compact = false }: { briefing: Briefing | null; compact?: boolean }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function refresh() {
    startTransition(async () => {
      const result = await briefingNowAction();
      setMessage(result.ok ? "Leyla schreibt ein neues Briefing …" : result.error);
      if (result.ok) setTimeout(() => router.refresh(), 12_000);
    });
  }

  return (
    <section className="card flex flex-col gap-3 p-4" aria-labelledby="briefing-heading">
      <div className="flex items-start gap-3">
        <AgentAvatar agentId="daily-briefing" size={compact ? 44 : 56} state={pending ? "working" : "idle"} title="Leyla · Tagesbriefing" />
        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] font-semibold uppercase tracking-wide text-subtle">
            {briefing ? `Leylas Briefing · ${dayLabel(briefing.day)}` : "Leylas Briefing"}
          </p>
          <h2 id="briefing-heading" className="text-[14px] font-semibold text-ink">
            {briefing?.headline ?? "Noch kein Briefing – Leyla meldet sich jeden Morgen zwischen 7 und 10 Uhr."}
          </h2>
        </div>
        <button type="button" onClick={refresh} disabled={pending} className="btn btn-ghost btn-icon h-8 w-8" aria-label="Briefing jetzt neu erstellen">
          {pending ? <IconLoader className="h-3.5 w-3.5" /> : <IconRefresh className="h-3.5 w-3.5" />}
        </button>
      </div>

      {briefing && briefing.priorities.length > 0 && (
        <ol className="flex flex-col gap-1.5">
          {briefing.priorities.map((priority, index) => {
            const content = (
              <>
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10.5px] font-bold text-amber-800 dark:bg-amber-500/20 dark:text-amber-200">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] font-semibold text-ink">{priority.title}</span>
                  {priority.why && <span className="block text-[11px] text-muted">{priority.why}</span>}
                </span>
                {priority.link && <IconArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-subtle" />}
              </>
            );
            return (
              <li key={index}>
                {priority.link ? (
                  <Link href={priority.link} className="flex items-start gap-2.5 rounded-[8px] px-2 py-1.5 transition hover:bg-surface-2">
                    {content}
                  </Link>
                ) : (
                  <div className="flex items-start gap-2.5 px-2 py-1.5">{content}</div>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {briefing && !compact && briefing.summary && <p className="text-[12px] leading-relaxed text-muted">{briefing.summary}</p>}

      {briefing && (
        <p className="flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-2 text-[11px] text-muted">
          <span>{briefing.facts.newRequests} neue Anfragen (24 h)</span>
          <span>{briefing.facts.openApprovals} offene Freigaben</span>
          <span>{briefing.facts.activeTickets} Tickets</span>
          <span>{briefing.facts.sitesDown > 0 ? `${briefing.facts.sitesDown} Seite(n) down` : "Alle Seiten online"}</span>
          <span>KI-Kosten {formatEur(briefing.facts.spentEur)} / {formatEur(briefing.facts.budgetEur)}</span>
        </p>
      )}
      {message && <p className="text-[10.5px] text-muted">{message}</p>}
    </section>
  );
}
