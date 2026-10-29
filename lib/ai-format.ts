import type { AgentRunStatus, JobStatus } from "@/lib/types";

const eurFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const preciseEurFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});

const numberFormatter = new Intl.NumberFormat("de-DE");

/** Small AI costs are often fractions of a cent, so show four decimals below 1 €. */
export function formatEur(value: number | null | undefined): string {
  if (value === null || value === undefined) return "–";
  return Math.abs(value) > 0 && Math.abs(value) < 1 ? preciseEurFormatter.format(value) : eurFormatter.format(value);
}

export function formatTokens(value: number | null | undefined): string {
  if (value === null || value === undefined) return "–";
  return numberFormatter.format(value);
}

export function formatDuration(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return "–";
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1).replace(".", ",")} s`;
}

type BadgeMeta = { label: string; badge: string; dot: string };

export const RUN_STATUSES: Record<AgentRunStatus, BadgeMeta> = {
  running: { label: "Läuft", badge: "bg-sky-50 text-sky-700 ring-sky-200", dot: "bg-sky-500" },
  succeeded: { label: "Erfolgreich", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  invalid_output: { label: "Ungültige Ausgabe", badge: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-500" },
  failed: { label: "Fehlgeschlagen", badge: "bg-rose-50 text-rose-700 ring-rose-200", dot: "bg-rose-500" },
  blocked: { label: "Blockiert", badge: "bg-slate-100 text-slate-700 ring-slate-200", dot: "bg-slate-500" },
  abandoned: { label: "Abgebrochen", badge: "bg-slate-100 text-slate-700 ring-slate-200", dot: "bg-slate-400" },
};

export const JOB_STATUSES: Record<JobStatus, BadgeMeta> = {
  queued: { label: "Wartend", badge: "bg-sky-50 text-sky-700 ring-sky-200", dot: "bg-sky-500" },
  running: { label: "Läuft", badge: "bg-violet-50 text-violet-700 ring-violet-200", dot: "bg-violet-500" },
  succeeded: { label: "Erledigt", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  failed: { label: "Fehlgeschlagen", badge: "bg-rose-50 text-rose-700 ring-rose-200", dot: "bg-rose-500" },
  dead: { label: "Aufgegeben", badge: "bg-rose-50 text-rose-700 ring-rose-200", dot: "bg-rose-700" },
  cancelled: { label: "Abgebrochen", badge: "bg-slate-100 text-slate-700 ring-slate-200", dot: "bg-slate-400" },
};

export const JOB_TYPE_LABELS: Record<string, string> = {
  "ai.maintenance": "Wartung",
  "ai.agent-test": "Agenten-Testlauf",
};

export const TRIGGER_LABELS: Record<string, string> = {
  "email.received": "Neue E-Mail",
  "workflow.step": "Workflow-Schritt",
  manual: "Manuell",
};

export const PERMISSION_LABELS: { key: keyof import("@/lib/types").AgentPermissions; label: string; hint: string }[] = [
  { key: "readEmails", label: "Darf E-Mails lesen", hint: "Zugriff auf analysierte Nachrichten verbundener Postfächer." },
  { key: "analyzeAttachments", label: "Darf Anhänge analysieren", hint: "Nur geprüfte Dateitypen und -größen." },
  { key: "readCrm", label: "Darf CRM-Daten lesen", hint: "Kunden, Kontakte und Projekte über definierte Services." },
  { key: "createDrafts", label: "Darf Entwürfe erstellen", hint: "Notizen, Schätzungen und Antwortentwürfe als Entwurf." },
  { key: "writeCrm", label: "Darf CRM-Datensätze ändern", hint: "Nur nach Freigabe, niemals Löschungen." },
  { key: "requiresApproval", label: "Benötigt Benutzerfreigabe", hint: "Ergebnisse landen in der Freigabe-Inbox." },
  { key: "sendNotifications", label: "Darf Benachrichtigungen versenden", hint: "Telegram/WhatsApp, ohne vertrauliche Inhalte." },
];
