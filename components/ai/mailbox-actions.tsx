"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reanalyzeEmailAction, syncEmailConnectionAction, testEmailConnectionAction } from "@/app/actions";
import type { ConnectionTestResult } from "@/lib/types";
import { IconCheck, IconLoader, IconRefresh, IconSparkles, IconX } from "@/components/ui/icons";

export function MailboxActions({ id, enabled }: { id: string; enabled: boolean }) {
  const router = useRouter();
  const [test, setTest] = useState<ConnectionTestResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<"test" | "sync" | null>(null);

  function run(kind: "test" | "sync") {
    setError(null);
    setMessage(null);
    setTest(null);
    setBusy(kind);
    startTransition(async () => {
      if (kind === "test") {
        const result = await testEmailConnectionAction(id);
        if (!result.ok) setError(result.error);
        else setTest(result.result);
      } else {
        const result = await syncEmailConnectionAction(id);
        if (!result.ok) setError(result.error);
        else setMessage("Abruf eingeplant. Er läuft beim nächsten Job-Durchlauf (spätestens in einer Minute).");
      }
      setBusy(null);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        <button type="button" onClick={() => run("test")} disabled={pending} className="btn btn-secondary h-8 text-[11.5px]">
          {busy === "test" ? <IconLoader className="h-3.5 w-3.5" /> : <IconCheck className="h-3.5 w-3.5" />}
          Verbindung testen
        </button>
        <button type="button" onClick={() => run("sync")} disabled={pending || !enabled} className="btn btn-secondary h-8 text-[11.5px]">
          {busy === "sync" ? <IconLoader className="h-3.5 w-3.5" /> : <IconRefresh className="h-3.5 w-3.5" />}
          Jetzt abrufen
        </button>
      </div>
      {test && (
        <ul className="flex flex-col gap-1 text-[11px]" role="status">
          <TestLine ok={test.imapOk} label="IMAP" text={test.imapMessage} />
          <TestLine ok={test.smtpOk} label="SMTP" text={test.smtpMessage} />
        </ul>
      )}
      {message && (
        <p className="text-[11px] font-medium text-emerald-700" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="text-[11px] font-medium text-rose-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function TestLine({ ok, label, text }: { ok: boolean; label: string; text?: string | null }) {
  return (
    <li className={ok ? "flex items-start gap-1.5 text-emerald-700" : "flex items-start gap-1.5 text-rose-600"}>
      {ok ? <IconCheck className="mt-0.5 h-3 w-3 shrink-0" /> : <IconX className="mt-0.5 h-3 w-3 shrink-0" />}
      <span>
        <strong>{label}:</strong> {text}
      </span>
    </li>
  );
}

export function ReanalyzeButton({ id }: { id: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await reanalyzeEmailAction(id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("Neue Analyse eingeplant.");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button type="button" onClick={run} disabled={pending} className="btn btn-secondary">
        {pending ? <IconLoader className="h-3.5 w-3.5" /> : <IconSparkles className="h-3.5 w-3.5" />}
        Erneut analysieren
      </button>
      {message && <p className="text-[10.5px] font-medium text-emerald-700">{message}</p>}
      {error && <p className="text-[10.5px] font-medium text-rose-600">{error}</p>}
    </div>
  );
}
