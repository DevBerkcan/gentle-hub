"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { runLeadCheckAction } from "@/app/actions";
import { cn } from "@/lib/cn";
import { shortUrl } from "@/lib/format";
import type { LeadCheck } from "@/lib/types";
import { AgentAvatar } from "@/components/ai/agent-avatar";
import { IconExternal, IconLoader, IconRefresh } from "@/components/ui/icons";

function Signal({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold",
        ok
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
          : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
      )}
    >
      {ok ? "✓" : "✕"} {label}
    </span>
  );
}

function List({ title, items }: { title: string; items?: string[] | null }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h4 className="text-[10px] font-semibold uppercase tracking-wide text-subtle">{title}</h4>
      <ul className="mt-1 flex list-disc flex-col gap-0.5 pl-4 text-[11.5px] leading-relaxed text-ink">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

/** What the lead-check agent found on the prospect's current website. */
export function LeadCheckCard({ emailId, check }: { emailId: string; check: LeadCheck | null }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const facts = check?.facts;
  const insights = check?.insights;
  const year = new Date().getFullYear();

  function rerun() {
    startTransition(async () => {
      const result = await runLeadCheckAction(emailId);
      setMessage(result.ok ? "Website wird geprüft (ca. 20 Sekunden)." : result.error);
      if (result.ok) setTimeout(() => router.refresh(), 15_000);
    });
  }

  return (
    <section className="card flex flex-col gap-3 p-4" aria-labelledby="lead-heading">
      <div className="flex items-center gap-2.5">
        <AgentAvatar agentId="lead-check" size={40} state={pending ? "working" : "idle"} title="Selin · Lead-Check" />
        <div className="min-w-0 flex-1">
          <h2 id="lead-heading" className="text-[12.5px] font-semibold text-ink">
            Website des Interessenten
            <span className="ml-1.5 font-normal text-muted">geprüft von Selin</span>
          </h2>
          {(check?.finalUrl ?? check?.url) && (
            <a
              href={check?.finalUrl ?? check?.url ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline"
            >
              {shortUrl(check?.finalUrl ?? check?.url)}
              <IconExternal className="h-3 w-3" />
            </a>
          )}
        </div>
        <button type="button" onClick={rerun} disabled={pending} className="btn btn-ghost btn-icon h-8 w-8" aria-label="Website erneut prüfen">
          {pending ? <IconLoader className="h-3.5 w-3.5" /> : <IconRefresh className="h-3.5 w-3.5" />}
        </button>
      </div>

      {!check && <p className="text-[11.5px] text-muted">Noch nicht geprüft. Der Lead-Check läuft automatisch bei neuen Anfragen.</p>}
      {check && check.status !== "done" && (
        <p className="text-[11.5px] text-muted">{check.reason ?? (check.status === "skipped" ? "Keine Website gefunden." : "Website nicht erreichbar.")}</p>
      )}

      {facts && (
        <div className="flex flex-wrap gap-1.5">
          <Signal ok={facts.https && (facts.certDaysLeft ?? 99) > 14} label="HTTPS" />
          <Signal ok={facts.mobileViewport} label="Mobil" />
          <Signal ok={facts.hasImpressum} label="Impressum" />
          <Signal ok={facts.hasDatenschutz} label="Datenschutz" />
          <Signal ok={facts.responseMs < 1500} label={`${(facts.responseMs / 1000).toFixed(1)} s`} />
          {facts.copyrightYear != null && <Signal ok={year - facts.copyrightYear <= 2} label={`© ${facts.copyrightYear}`} />}
          {facts.cms && (
            <span className="inline-flex items-center rounded-full bg-surface-2 px-2 py-0.5 text-[10.5px] font-semibold text-muted">{facts.cms}</span>
          )}
        </div>
      )}

      {insights?.summary && <p className="text-[12px] leading-relaxed text-ink">{insights.summary}</p>}
      <List title="Verkaufsargumente" items={insights?.salesArguments} />
      <List title="Schwächen" items={insights?.weaknesses} />
      <List title="Quick-Wins" items={insights?.quickWins} />
      <List title="Für die Schätzung" items={insights?.estimateHints} />
      {message && <p className="text-[10.5px] text-muted">{message}</p>}
    </section>
  );
}
