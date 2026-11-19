import type { TenderStatus } from "@/lib/types";

export const TENDER_STATUS: Record<TenderStatus, { label: string; className: string }> = {
  new: { label: "Neu", className: "bg-slate-100 text-slate-700" },
  scoring: { label: "Nora prüft", className: "bg-sky-50 text-sky-700" },
  scored: { label: "Bewertet", className: "bg-indigo-50 text-indigo-700" },
  failed: { label: "Fehler", className: "bg-rose-50 text-rose-700" },
  bid: { label: "Wir bewerben uns", className: "bg-amber-50 text-amber-800" },
  submitted: { label: "Eingereicht", className: "bg-blue-50 text-blue-700" },
  won: { label: "Gewonnen", className: "bg-emerald-50 text-emerald-700" },
  lost: { label: "Verloren", className: "bg-rose-50 text-rose-700" },
  skipped: { label: "Gelassen", className: "bg-slate-100 text-slate-500" },
};

export const TENDER_SOURCE: Record<string, string> = { ted: "TED (EU)", mail: "Portal-Alarm", manual: "Von Hand" };

export const TENDER_VIEWS = [
  { key: "recommended", label: "Empfohlen" },
  { key: "open", label: "Offen" },
  { key: "active", label: "Laufend" },
  { key: "done", label: "Erledigt" },
  { key: "all", label: "Alle" },
] as const;

export function fitClass(fit?: number | null) {
  if (fit == null) return "bg-slate-100 text-slate-600";
  if (fit >= 70) return "bg-emerald-50 text-emerald-700";
  if (fit >= 50) return "bg-amber-50 text-amber-800";
  return "bg-slate-100 text-slate-600";
}
