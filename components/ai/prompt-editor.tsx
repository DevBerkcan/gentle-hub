"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addAiAgentPromptAction } from "@/app/actions";
import { formatDateTime } from "@/lib/format";
import type { AgentPrompt } from "@/lib/types";
import { Field, FormError, SuccessNote } from "@/components/ui/field";
import { IconCheck, IconLoader } from "@/components/ui/icons";

export function PromptEditor({
  agentId,
  currentVersion,
  prompts,
}: {
  agentId: string;
  currentVersion: number;
  prompts: AgentPrompt[];
}) {
  const router = useRouter();
  const current = prompts.find((prompt) => prompt.version === currentVersion);
  const [value, setValue] = useState(current?.systemPrompt ?? "");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const dirty = value.trim() !== (current?.systemPrompt ?? "").trim();

  function save() {
    setError(null);
    setMessage(null);
    if (value.trim().length < 20) {
      setError("Die Systemanweisung muss mindestens 20 Zeichen lang sein.");
      return;
    }

    startTransition(async () => {
      const result = await addAiAgentPromptAction(agentId, value, note);
      if (!result.ok) {
        setError(result.errors?.systemPrompt ?? result.error);
        return;
      }
      setNote("");
      setMessage(`Version ${result.version} gespeichert und aktiv.`);
      router.refresh();
    });
  }

  return (
    <section className="card flex flex-col gap-3 p-5" aria-labelledby="prompt-heading">
      <div>
        <h2 id="prompt-heading" className="text-[13px] font-semibold text-ink">
          Systemanweisung <span className="font-normal text-muted">(aktiv: v{currentVersion})</span>
        </h2>
        <p className="mt-0.5 text-[11px] text-muted">
          Jede Änderung wird als neue Version gespeichert. Die Sicherheitsregeln gegen Prompt-Injection hängt der Server
          immer an und sind hier nicht abschaltbar.
        </p>
      </div>

      <FormError message={error} />
      <SuccessNote message={message} />

      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="textarea min-h-56 font-mono text-[11.5px] leading-relaxed"
        maxLength={20_000}
        aria-label="Systemanweisung"
      />
      <Field label="Änderungsnotiz" htmlFor="prompt-note">
        <input
          id="prompt-note"
          className="input"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={400}
          placeholder="Was wurde geändert und warum?"
        />
      </Field>
      <div className="flex justify-end">
        <button type="button" onClick={save} disabled={!dirty || pending} className="btn btn-secondary">
          {pending ? <IconLoader className="h-3.5 w-3.5" /> : <IconCheck className="h-3.5 w-3.5" />}
          {pending ? "Speichert …" : "Als neue Version speichern"}
        </button>
      </div>

      {prompts.length > 1 && (
        <details className="border-t border-line pt-3">
          <summary className="cursor-pointer text-[11.5px] font-semibold text-ink">
            Versionsverlauf ({prompts.length})
          </summary>
          <ul className="mt-2 flex flex-col gap-2">
            {prompts.map((prompt) => (
              <li key={prompt.version} className="rounded-[8px] border border-line p-3">
                <p className="text-[11px] font-semibold text-ink">
                  v{prompt.version}
                  {prompt.version === currentVersion && <span className="ml-2 text-emerald-700">aktiv</span>}
                  <span className="ml-2 font-normal text-muted">
                    {formatDateTime(prompt.createdAt)} · {prompt.createdBy ?? "–"}
                  </span>
                </p>
                {prompt.changeNote && <p className="mt-1 text-[11px] text-muted">{prompt.changeNote}</p>}
                <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap font-mono text-[10.5px] text-ink-2">
                  {prompt.systemPrompt}
                </pre>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
