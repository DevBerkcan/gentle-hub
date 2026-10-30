import type { Metadata } from "next";
import { getCrmStatusData, getEmailConnectionEventsData, getEmailConnectionsData, getMessengerData } from "@/lib/data";
import { formatDateTime, formatRelative } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { EmailConnection } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { MailboxFormButton } from "@/components/ai/mailbox-form-button";
import { MailboxActions } from "@/components/ai/mailbox-actions";
import { MessengerPanel } from "@/components/ai/messenger-panel";
import { IconAlert, IconLock, IconMail } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Verbindungen" };

export default async function AiConnectionsPage() {
  const [{ items, encryptionConfigured }, messenger, crm] = await Promise.all([
    getEmailConnectionsData(),
    getMessengerData(),
    getCrmStatusData(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="AI Operations"
        title="Verbindungen"
        description="Postfächer per IMAP/SMTP über TLS. Zugangsdaten werden nur serverseitig und verschlüsselt gespeichert."
        action={<MailboxFormButton disabled={!encryptionConfigured} />}
      />

      {!encryptionConfigured && (
        <p className="flex items-start gap-2 rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-900">
          <IconAlert className="mt-0.5 h-4 w-4 shrink-0" />
          Auf dem Server fehlt der Schlüssel für Zugangsdaten (Security:IntegrationKey). Postfächer können erst danach
          verbunden werden.
        </p>
      )}

      <section className="flex flex-col gap-3" aria-labelledby="mailboxes-heading">
        <h2 id="mailboxes-heading" className="text-[14px] font-semibold text-ink">
          E-Mail-Postfächer
        </h2>
        {items.length === 0 ? (
          <EmptyState
            icon={<IconMail className="h-4 w-4" />}
            title="Noch kein Postfach verbunden"
            description="Füge zuerst das Testpostfach hinzu. Echte Postfächer erst, wenn der Ablauf mit Testdaten funktioniert."
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {items.map((connection) => (
              <MailboxCard key={connection.id} connection={connection} />
            ))}
          </div>
        )}
      </section>

      <section className="card flex flex-col gap-2 p-5" aria-labelledby="crm-heading">
        <div className="flex items-center justify-between gap-2">
          <h2 id="crm-heading" className="text-[13.5px] font-semibold text-ink">
            GentleSuite CRM
          </h2>
          <span
            className={cn(
              "rounded-[5px] px-1.5 py-0.5 text-[10px] font-semibold",
              crm?.reachable ? "bg-emerald-50 text-emerald-700" : crm?.configured ? "bg-rose-50 text-rose-700" : "bg-surface-2 text-muted",
            )}
          >
            {crm?.reachable ? "Verbunden" : crm?.configured ? "Nicht erreichbar" : "Nicht konfiguriert"}
          </span>
        </div>
        <p className="text-[11.5px] text-muted">
          GentleSuite bleibt das führende CRM. GentleHub liest Kunden, Kontakte, Projekte und Angebote über eine eigene, nur lesende
          Schnittstelle und ordnet Kundenanfragen automatisch zu. Änderungen in GentleSuite passieren nur nach deiner Freigabe.
        </p>
        {crm?.frontendUrl && (
          <a href={crm.frontendUrl} target="_blank" rel="noopener noreferrer" className="w-fit text-[11.5px] font-semibold text-accent hover:underline">
            GentleSuite öffnen
          </a>
        )}
      </section>

      <MessengerPanel status={messenger} />
    </div>
  );
}

async function MailboxCard({ connection }: { connection: EmailConnection }) {
  const events = await getEmailConnectionEventsData(connection.id);
  const healthy = connection.lastSyncStatus !== "error";

  return (
    <article className="card flex flex-col gap-4 p-5">
      <header className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px]",
            connection.isEnabled ? "bg-accent-soft text-accent" : "bg-surface-2 text-subtle",
          )}
        >
          <IconMail className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[13.5px] font-semibold text-ink">{connection.label}</h3>
          <p className="truncate text-[11.5px] text-muted">{connection.emailAddress}</p>
        </div>
        <MailboxFormButton connection={connection} />
      </header>

      <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold">
        <Chip tone={connection.isEnabled ? "ok" : "off"}>{connection.isEnabled ? "Aktiv" : "Deaktiviert"}</Chip>
        <Chip tone={connection.analysisEnabled ? "ok" : "off"}>{connection.analysisEnabled ? "KI-Analyse an" : "KI-Analyse aus"}</Chip>
        <Chip tone={healthy ? "ok" : "error"}>
          {connection.lastSyncAt ? (healthy ? "Synchronisiert" : "Fehler beim Abruf") : "Noch nicht abgerufen"}
        </Chip>
        <Chip tone="off">
          <IconLock className="mr-1 inline h-3 w-3" />
          TLS
        </Chip>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11.5px]">
        <Meta label="IMAP">
          {connection.imapHost}:{connection.imapPort} ({connection.imapSecurity === "ssl" ? "SSL/TLS" : "STARTTLS"})
        </Meta>
        <Meta label="SMTP">
          {connection.smtpHost}:{connection.smtpPort} ({connection.smtpSecurity === "ssl" ? "SSL/TLS" : "STARTTLS"})
        </Meta>
        <Meta label="Letzte Synchronisierung">
          <span title={formatDateTime(connection.lastSyncAt)}>{formatRelative(connection.lastSyncAt)}</span>
        </Meta>
        <Meta label="Übernommene E-Mails">{connection.messageCount}</Meta>
      </dl>

      {connection.lastError && (
        <p className="rounded-[8px] border border-rose-200 bg-rose-50 px-3 py-2 text-[11.5px] text-rose-800">
          {connection.lastError}
          {connection.consecutiveFailures > 1 && ` (${connection.consecutiveFailures}× in Folge)`}
        </p>
      )}

      <MailboxActions id={connection.id} enabled={connection.isEnabled} />

      <details className="border-t border-line pt-3">
        <summary className="cursor-pointer text-[11.5px] font-semibold text-ink">Verlauf & Fehlerhistorie ({events.length})</summary>
        <ul className="mt-2 flex flex-col gap-1.5">
          {events.map((event, index) => (
            <li key={index} className="flex gap-2 text-[11px]">
              <time className="w-28 shrink-0 text-subtle">{formatDateTime(event.createdAt)}</time>
              <span className={event.kind === "error" ? "text-rose-600" : "text-ink-2"}>{event.message}</span>
            </li>
          ))}
        </ul>
      </details>
    </article>
  );
}

function Chip({ tone, children }: { tone: "ok" | "off" | "error"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "rounded-[5px] px-1.5 py-0.5",
        tone === "ok" && "bg-emerald-50 text-emerald-700",
        tone === "off" && "bg-surface-2 text-muted",
        tone === "error" && "bg-rose-50 text-rose-700",
      )}
    >
      {children}
    </span>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[9.5px] font-semibold uppercase tracking-wide text-subtle">{label}</dt>
      <dd className="truncate font-medium text-ink">{children}</dd>
    </div>
  );
}
