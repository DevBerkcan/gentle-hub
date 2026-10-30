"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  pairTelegramAction,
  revokeMessengerAction,
  sendTelegramTestAction,
  updateMessengerPreferencesAction,
} from "@/app/actions";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { MessengerLink, MessengerStatus, NotificationPreferences, PairingCode } from "@/lib/types";
import { CopyButton } from "@/components/ui/copy-button";
import { FormError, SuccessNote } from "@/components/ui/field";
import { IconCheck, IconExternal, IconLoader, IconRefresh, IconX } from "@/components/ui/icons";

const PREFERENCE_LABELS: { key: keyof NotificationPreferences; label: string }[] = [
  { key: "customerRequests", label: "Neue Kundenanfragen" },
  { key: "importantEmails", label: "Wichtige E-Mails" },
  { key: "approvals", label: "Freigaben und fertige Schätzungen" },
  { key: "failures", label: "Fehlgeschlagene Agentenläufe" },
  { key: "dailyDigest", label: "Morgendliche Zusammenfassung (ca. 7 Uhr)" },
];

export function MessengerPanel({ status }: { status: MessengerStatus }) {
  const telegram = status.links.find((link) => link.channel === "telegram");

  return (
    <section className="card flex flex-col gap-4 p-5" aria-labelledby="messenger-heading">
      <div>
        <h2 id="messenger-heading" className="text-[13.5px] font-semibold text-ink">
          Telegram
        </h2>
        <p className="mt-0.5 text-[11.5px] text-muted">
          Hinweise aufs Handy: neue Anfragen, Freigaben, Fehler. Nachrichten enthalten nie vertrauliche Inhalte; Entscheidungen
          triffst du immer in GentleHub selbst.
        </p>
      </div>

      {!status.telegramConfigured ? (
        <p className="rounded-[8px] border border-amber-200 bg-amber-50 px-3 py-2 text-[11.5px] text-amber-900">
          Auf dem Server ist noch kein Telegram-Bot hinterlegt (Telegram:BotToken).
        </p>
      ) : telegram ? (
        <LinkedTelegram link={telegram} />
      ) : (
        <PairTelegram botUsername={status.telegramBotUsername} mode={status.telegramMode} />
      )}

      {status.recent.length > 0 && (
        <details className="border-t border-line pt-3">
          <summary className="cursor-pointer text-[11.5px] font-semibold text-ink">Letzte Benachrichtigungen ({status.recent.length})</summary>
          <ul className="mt-2 flex flex-col gap-1.5">
            {status.recent.map((item, index) => (
              <li key={index} className="flex gap-2 text-[11px]">
                <time className="w-28 shrink-0 text-subtle">{formatDateTime(item.createdAt)}</time>
                <span className="min-w-0 flex-1 truncate text-ink-2">{item.title}</span>
                <span
                  className={cn(
                    "shrink-0 font-semibold",
                    item.status === "sent" && "text-emerald-700",
                    item.status === "failed" && "text-rose-600",
                    (item.status === "queued" || item.status === "suppressed") && "text-muted",
                  )}
                  title={item.error ?? undefined}
                >
                  {item.status === "sent" ? "gesendet" : item.status === "failed" ? "fehlgeschlagen" : item.status === "queued" ? "geplant" : "unterdrückt"}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="border-t border-line pt-3">
        <h3 className="text-[12px] font-semibold text-ink">WhatsApp</h3>
        <p className="mt-0.5 text-[11px] text-muted">
          Vorbereitet über die offizielle WhatsApp Business Platform. Benötigt ein verifiziertes Meta-Business-Konto,
          freigegebene Nachrichtenvorlagen und eine Einwilligung; Nachrichten außerhalb von 24 Stunden sind kostenpflichtig.
        </p>
      </div>
    </section>
  );
}

function PairTelegram({ botUsername, mode }: { botUsername?: string | null; mode: string }) {
  const router = useRouter();
  const [pairing, setPairing] = useState<PairingCode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function start() {
    setError(null);
    startTransition(async () => {
      const result = await pairTelegramAction();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setPairing(result.pairing);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <FormError message={error} />
      {!pairing ? (
        <button type="button" onClick={start} disabled={pending} className="btn btn-primary w-fit">
          {pending ? <IconLoader className="h-3.5 w-3.5" /> : <IconExternal className="h-3.5 w-3.5" />}
          Telegram verbinden
        </button>
      ) : (
        <ol className="flex list-decimal flex-col gap-2 pl-4 text-[12px] text-ink">
          <li>
            Öffne{" "}
            <a href={pairing.deepLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent underline">
              @{botUsername ?? "GentleHub-Bot"}
            </a>{" "}
            auf dem Handy und tippe auf „Starten“.
          </li>
          <li>
            Oder sende dem Bot: <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[11.5px]">/start {pairing.code}</code>
            <CopyButton value={`/start ${pairing.code}`} label="Befehl kopieren" />
          </li>
          <li>
            Gültig bis {formatDateTime(pairing.expiresAt)}, nur einmal verwendbar.{" "}
            <button type="button" onClick={() => router.refresh()} className="inline-flex items-center gap-1 font-semibold text-accent">
              <IconRefresh className="h-3 w-3" />
              Status aktualisieren
            </button>
          </li>
        </ol>
      )}
      {mode === "polling" && (
        <p className="text-[10.5px] text-subtle">Lokaler Modus: Nachrichten an den Bot werden etwa einmal pro Minute abgeholt.</p>
      )}
    </div>
  );
}

function LinkedTelegram({ link }: { link: MessengerLink }) {
  const router = useRouter();
  const [preferences, setPreferences] = useState<NotificationPreferences>(link.preferences);
  const [quietFrom, setQuietFrom] = useState(link.quietFrom ?? "");
  const [quietTo, setQuietTo] = useState(link.quietTo ?? "");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(task: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await task();
      if (!result.ok) {
        setError(result.error ?? "Fehler");
        return;
      }
      setMessage(success);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="flex items-center gap-2 text-[12px] text-ink">
        <span className="rounded-[5px] bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">Verbunden</span>
        {link.externalName ?? "Telegram-Chat"} · seit {formatDateTime(link.linkedAt)}
      </p>
      <FormError message={error} />
      <SuccessNote message={message} />

      <fieldset className="flex flex-col gap-1.5">
        <legend className="label mb-1">Benachrichtigungen</legend>
        {PREFERENCE_LABELS.map((item) => (
          <label key={item.key} className="inline-flex cursor-pointer items-center gap-2 text-[12px] text-ink">
            <input
              type="checkbox"
              checked={preferences[item.key]}
              onChange={(event) => setPreferences((current) => ({ ...current, [item.key]: event.target.checked }))}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            {item.label}
          </label>
        ))}
      </fieldset>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-[11px] text-muted">
          Ruhezeit von
          <input type="time" className="input h-9 w-28" value={quietFrom} onChange={(event) => setQuietFrom(event.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-[11px] text-muted">
          bis
          <input type="time" className="input h-9 w-28" value={quietTo} onChange={(event) => setQuietTo(event.target.value)} />
        </label>
        <p className="pb-2 text-[10.5px] text-subtle">Nachrichten in der Ruhezeit werden danach zugestellt.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => updateMessengerPreferencesAction(link.id, preferences, quietFrom, quietTo), "Einstellungen gespeichert.")}
          className="btn btn-primary h-8 text-[11.5px]"
        >
          {pending ? <IconLoader className="h-3.5 w-3.5" /> : <IconCheck className="h-3.5 w-3.5" />}
          Speichern
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => sendTelegramTestAction(), "Testnachricht gesendet.")}
          className="btn btn-secondary h-8 text-[11.5px]"
        >
          Testnachricht senden
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => revokeMessengerAction(link.id), "Verbindung getrennt.")}
          className="btn btn-ghost h-8 text-[11.5px] text-rose-600"
        >
          <IconX className="h-3.5 w-3.5" />
          Verbindung trennen
        </button>
      </div>
    </div>
  );
}
