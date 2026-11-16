"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { goLiveCheckAction } from "@/app/actions";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";
import type { GoLiveCheck } from "@/lib/types";

const RESULT_STYLE = {
  ok: { label: "OK", className: "bg-emerald-50 text-emerald-700" },
  warning: { label: "Hinweis", className: "bg-amber-50 text-amber-700" },
  error: { label: "Fehler", className: "bg-rose-50 text-rose-700" },
} as const;

/** Tolga's go-live check: enter the URL, get a measured checklist. No AI involved. */
export function GoLiveForm({ workflowId, defaultUrl }: { workflowId?: string; defaultUrl?: string }) {
  const router = useRouter();
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GoLiveCheck | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const response = await goLiveCheckAction(url, workflowId);
      if (!response.ok) {
        setError(response.error);
        return;
      }
      setResult(response.check);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor={`golive-url-${workflowId ?? "free"}`}>
          Website-Adresse
        </label>
        <input
          id={`golive-url-${workflowId ?? "free"}`}
          className="input flex-1"
          placeholder="www.kunde.de"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          required
          maxLength={400}
        />
        <button type="submit" className="btn btn-primary" disabled={pending || url.trim().length < 4}>
          {pending ? "Prüfe…" : "Go-Live prüfen"}
        </button>
      </form>
      {error && <p className="text-[11.5px] text-rose-600">{error}</p>}
      {result && <GoLiveResult check={result} />}
    </div>
  );
}

export function GoLiveResult({ check }: { check: GoLiveCheck }) {
  const errors = check.items.filter((item) => item.result === "error").length;
  const warnings = check.items.filter((item) => item.result === "warning").length;
  return (
    <div className="rounded-lg border border-line">
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-2 rounded-t-lg px-3 py-2 text-[12px] font-semibold",
          check.passed ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800",
        )}
      >
        <span>
          {check.passed ? "Bereit für den Go-Live" : `Noch nicht bereit: ${errors} ${errors === 1 ? "Fehler" : "Fehler"}`}
          {warnings > 0 && <span className="ml-1 font-medium">· {warnings} {warnings === 1 ? "Hinweis" : "Hinweise"}</span>}
        </span>
        <span className="text-[10.5px] font-medium opacity-80">
          {check.url} · {formatDateTime(check.createdAt)}
        </span>
      </div>
      <ul className="divide-y divide-line">
        {check.items.map((item) => {
          const style = RESULT_STYLE[item.result] ?? RESULT_STYLE.warning;
          return (
            <li key={item.key} className="flex items-start gap-2 px-3 py-1.5 text-[11.5px]">
              <span className={cn("mt-px w-14 shrink-0 rounded-[5px] px-1.5 py-0.5 text-center text-[9.5px] font-semibold", style.className)}>
                {style.label}
              </span>
              <span className="min-w-0 flex-1">
                <span className="font-medium text-ink">{item.label}</span>
                {item.detail && <span className="block text-muted">{item.detail}</span>}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
