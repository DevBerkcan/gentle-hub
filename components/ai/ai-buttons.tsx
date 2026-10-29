"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelAiJobAction, retryAiJobAction, testRunAiAgentAction } from "@/app/actions";
import { IconLoader, IconRefresh, IconSparkles, IconX } from "@/components/ui/icons";

export function TestRunButton({ agentId }: { agentId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await testRunAiAgentAction(agentId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("Testlauf eingeplant. Er läuft beim nächsten Job-Durchlauf.");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button type="button" onClick={run} disabled={pending} className="btn btn-secondary">
        {pending ? <IconLoader className="h-3.5 w-3.5" /> : <IconSparkles className="h-3.5 w-3.5" />}
        Testlauf mit Testdaten
      </button>
      {message && (
        <p className="text-[10.5px] font-medium text-emerald-700" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="text-[10.5px] font-medium text-rose-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function JobActions({ jobId, canRetry, canCancel }: { jobId: string; canRetry: boolean; canCancel: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!canRetry && !canCancel) return null;

  function act(kind: "retry" | "cancel") {
    setError(null);
    startTransition(async () => {
      const result = kind === "retry" ? await retryAiJobAction(jobId) : await cancelAiJobAction(jobId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <span className="inline-flex items-center gap-1">
      {canRetry && (
        <button type="button" onClick={() => act("retry")} disabled={pending} className="btn btn-ghost h-7 px-2 text-[11px]">
          {pending ? <IconLoader className="h-3 w-3" /> : <IconRefresh className="h-3 w-3" />}
          Erneut
        </button>
      )}
      {canCancel && (
        <button type="button" onClick={() => act("cancel")} disabled={pending} className="btn btn-ghost h-7 px-2 text-[11px] text-rose-600">
          <IconX className="h-3 w-3" />
          Abbrechen
        </button>
      )}
      {error && <span className="text-[10.5px] text-rose-600">{error}</span>}
    </span>
  );
}
