"use client";

import { useEffect, useState, useTransition } from "react";
import { revealSecretAction } from "@/app/actions";
import { CopyButton } from "@/components/ui/copy-button";
import {
  IconEye,
  IconEyeOff,
  IconLoader,
  IconLock,
  IconUnlock,
} from "@/components/ui/icons";

export function SecretValue({
  assetId,
  label = "Geheimnis",
}: {
  assetId: string;
  label?: string;
}) {
  const [secret, setSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!secret) return;
    const timer = window.setTimeout(() => setSecret(null), 60_000);
    return () => window.clearTimeout(timer);
  }, [secret]);

  function reveal() {
    setError(null);
    startTransition(async () => {
      const result = await revealSecretAction(assetId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSecret(result.secret);
    });
  }

  if (secret !== null) {
    return (
      <div className="mt-2 overflow-hidden rounded-[10px] border border-emerald-200 bg-emerald-50/60">
        <div className="flex items-center justify-between gap-2 border-b border-emerald-200/70 px-2.5 py-1.5">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
            <IconUnlock className="h-3 w-3" />
            {label}
          </span>
          <div className="flex items-center gap-0.5">
            <CopyButton value={secret} label="Geheimnis kopieren" showLabel />
            <button
              type="button"
              onClick={() => setSecret(null)}
              className="inline-flex h-8 items-center gap-1 rounded-[8px] px-2 text-[11px] font-medium text-emerald-800 transition hover:bg-emerald-100"
            >
              <IconEyeOff className="h-3.5 w-3.5" />
              Verbergen
            </button>
          </div>
        </div>
        <pre className="max-h-52 overflow-auto whitespace-pre-wrap break-all px-3 py-2.5 font-mono text-[12px] leading-relaxed text-emerald-950">
          {secret}
        </pre>
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-line bg-surface-2 px-2.5 py-1.5 font-mono text-[12px] tracking-[0.12em] text-subtle">
        <IconLock className="h-3.5 w-3.5" />
        â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢
      </span>
      <button
        type="button"
        onClick={reveal}
        disabled={pending}
        className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-line bg-surface px-2.5 text-[11.5px] font-semibold text-ink transition hover:border-line-strong hover:bg-surface-2 disabled:opacity-50"
      >
        {pending ? <IconLoader className="h-3.5 w-3.5" /> : <IconEye className="h-3.5 w-3.5" />}
        {pending ? "EntschlÃ¼sselt â€¦" : "Anzeigen"}
      </button>
      {error && <span className="text-[11px] font-medium text-rose-600">{error}</span>}
    </div>
  );
}
