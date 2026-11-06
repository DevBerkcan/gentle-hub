"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateReplySettingsAction } from "@/app/actions";
import type { ReplySettings } from "@/lib/types";
import { FormError, SuccessNote } from "@/components/ui/field";
import { IconCheck, IconLoader } from "@/components/ui/icons";

/** Sender name and signature the reply agent uses; the signature is appended by the server, not the model. */
export function ReplySettingsForm({ settings }: { settings: ReplySettings }) {
  const router = useRouter();
  const [fromName, setFromName] = useState(settings.fromName);
  const [signature, setSignature] = useState(settings.signature);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await updateReplySettingsAction({ fromName: fromName.trim(), signature });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("Gespeichert. Gilt für alle neuen Antwortentwürfe.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="card flex flex-col gap-4 p-5" aria-labelledby="reply-settings-heading">
      <div>
        <h2 id="reply-settings-heading" className="text-[13px] font-semibold text-ink">
          Antworten an Kunden
        </h2>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
          Absendername und Signatur für Mails des Antwort-Agenten. Gesendet wird immer über das Postfach, in dem die Anfrage
          eingegangen ist, und nur nach deiner Freigabe.
        </p>
      </div>
      <FormError message={error} />
      <SuccessNote message={message} />
      <label className="flex flex-col gap-1 sm:max-w-sm">
        <span className="label">Absendername</span>
        <input className="input" value={fromName} maxLength={100} onChange={(event) => setFromName(event.target.value)} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="label">Signatur</span>
        <textarea
          className="textarea min-h-24 text-[12.5px] leading-relaxed"
          value={signature}
          maxLength={400}
          onChange={(event) => setSignature(event.target.value)}
          placeholder={"Viele Grüße\nBerk-Can Atesoglu\nGentle Group · gentlegroup.de"}
        />
        <span className="text-[10.5px] text-subtle">{signature.length}/400 Zeichen</span>
      </label>
      <div className="flex justify-end">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? <IconLoader className="h-3.5 w-3.5" /> : <IconCheck className="h-3.5 w-3.5" />}
          Speichern
        </button>
      </div>
    </form>
  );
}
