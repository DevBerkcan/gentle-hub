"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { checkMonitoringAction, toggleMonitoringAction } from "@/app/actions";
import { cn } from "@/lib/cn";
import { formatRelative, shortUrl } from "@/lib/format";
import type { MonitorStatus, MonitorTarget } from "@/lib/types";
import { IconExternal, IconLoader, IconRefresh } from "@/components/ui/icons";

const STATUS: Record<MonitorStatus, { label: string; dot: string; bar: string }> = {
  up: { label: "Erreichbar", dot: "bg-emerald-500", bar: "bg-emerald-400" },
  degraded: { label: "Eingeschränkt", dot: "bg-amber-500", bar: "bg-amber-400" },
  down: { label: "Nicht erreichbar", dot: "bg-rose-500", bar: "bg-rose-500" },
  unknown: { label: "Noch nicht geprüft", dot: "bg-slate-300 dark:bg-slate-600", bar: "bg-line" },
};

function certLabel(days?: number | null) {
  if (days == null) return null;
  if (days < 0) return { text: "SSL abgelaufen", className: "text-rose-600" };
  if (days <= 14) return { text: `SSL läuft in ${days} T. ab`, className: "text-amber-700 dark:text-amber-300" };
  return { text: `SSL ${days} T.`, className: "text-subtle" };
}

export function MonitorCheckButton() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        className="btn btn-secondary"
        onClick={() =>
          startTransition(async () => {
            const result = await checkMonitoringAction();
            setMessage(result.ok ? "Prüfung läuft, Ergebnisse in ca. 30 Sekunden." : result.error);
            // Results arrive asynchronously; refresh once the job had time to run.
            if (result.ok) setTimeout(() => router.refresh(), 20_000);
          })
        }
      >
        {pending ? <IconLoader className="h-3.5 w-3.5" /> : <IconRefresh className="h-3.5 w-3.5" />}
        Jetzt prüfen
      </button>
      {message && <span className="text-[10.5px] text-muted">{message}</span>}
    </div>
  );
}

export function MonitorList({ targets }: { targets: MonitorTarget[] }) {
  return (
    <ul className="card divide-y divide-line overflow-hidden">
      {targets.map((target) => (
        <MonitorRow key={target.projectId} target={target} />
      ))}
    </ul>
  );
}

function MonitorRow({ target }: { target: MonitorTarget }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const meta = STATUS[target.status];
  const cert = certLabel(target.certDaysLeft);
  const bars = [...Array(Math.max(0, 24 - target.recent.length)).fill("unknown"), ...target.recent] as MonitorStatus[];

  return (
    <li className={cn("flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4", !target.isEnabled && "opacity-60")}>
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", meta.dot)} title={meta.label} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <Link href={`/p/${target.projectSlug}`} className="text-[12.5px] font-semibold text-ink hover:underline">
              {target.projectName}
            </Link>
            <span className="text-[10.5px] font-medium text-muted">{target.isEnabled ? meta.label : "Pausiert"}</span>
          </div>
          <a
            href={target.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-center gap-1 text-[11.5px] text-accent hover:underline"
          >
            <span className="truncate">{shortUrl(target.url)}</span>
            <IconExternal className="h-3 w-3 shrink-0" />
          </a>
          {target.lastError && target.status !== "up" && <p className="text-[11px] text-rose-600">{target.lastError}</p>}
        </div>
      </div>

      <div className="hidden items-end gap-[2px] md:flex" aria-label="Letzte Prüfungen">
        {bars.map((status, index) => (
          <span key={index} className={cn("h-5 w-1.5 rounded-[1px]", STATUS[status].bar)} title={STATUS[status].label} />
        ))}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 whitespace-nowrap text-[11px] sm:w-[300px] sm:flex-nowrap sm:justify-end">
        <span className="tabular-nums text-muted">{target.lastResponseMs != null ? `${target.lastResponseMs} ms` : "–"}</span>
        {cert && <span className={cn("font-medium", cert.className)}>{cert.text}</span>}
        <span className="text-subtle">{target.lastCheckAt ? formatRelative(target.lastCheckAt) : "nie"}</span>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await toggleMonitoringAction(target.projectId, !target.isEnabled);
              router.refresh();
            })
          }
          className="btn btn-ghost h-7 px-2 text-[10.5px]"
        >
          {target.isEnabled ? "Pausieren" : "Überwachen"}
        </button>
      </div>
    </li>
  );
}
