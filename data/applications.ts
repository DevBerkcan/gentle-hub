import type { Application, ApplicationCategory } from "@/types";
import { isValidExternalUrl } from "@/lib/utils";

/** Human-readable label per category, in the order the filters are shown. */
export const CATEGORY_LABELS: Record<ApplicationCategory, string> = {
  saas: "SaaS",
  crm: "CRM",
  internal: "Interne Tools",
  customer: "Kundenprojekte",
  tool: "Tools",
};

const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS) as ApplicationCategory[];

/**
 * Central registry of every application reachable from GentleHub.
 *
 * To add a new application, append an object here — no other file needs to
 * change. Filters only show categories that are actually in use.
 *
 * ⚠️ BEISPIELEINTRÄGE: Die folgenden Anwendungen und URLs sind Platzhalter
 * und müssen durch die echten Anwendungen der Gentle Group ersetzt werden.
 */
export const applications: Application[] = [
  {
    id: "gentletrack",
    name: "GentleTrack",
    description: "Projektfortschritt, Meilensteine und Kommunikation an einem gemeinsamen Ort.",
    url: "https://gentletrack.gentlegroup.studio",
    category: "saas",
    tags: ["projekte", "meilensteine", "team"],
    isFavorite: true,
  },
  {
    id: "gentlebook",
    name: "GentleBook",
    description: "Online-Buchung und Serviceverwaltung für Kundentermine.",
    url: "https://gentlebook.gentlegroup.studio",
    category: "saas",
    tags: ["buchung", "termine", "service"],
    isFavorite: true,
  },
  {
    id: "gentleaccess",
    name: "GentleAccess",
    description: "Zentrales Identitäts- und Zugriffsmanagement für alle Produkte.",
    url: "https://gentleaccess.gentlegroup.studio",
    category: "saas",
    tags: ["identität", "sso", "rollen"],
  },
  {
    id: "gentlecalc",
    name: "GentleCalc",
    description: "Angebote kalkulieren und Preismodelle live durchrechnen.",
    url: "https://gentlecalc.gentlegroup.studio",
    category: "saas",
    tags: ["pricing", "angebote", "kalkulation"],
    environment: "staging",
  },
  {
    id: "gentlesuite",
    name: "GentleSuite",
    description: "Der gemeinsame Arbeitsbereich für Dokumente, Notizen und Wissen.",
    url: "https://gentlesuite.gentlegroup.studio",
    category: "saas",
    tags: ["dokumente", "wissen", "notizen"],
  },
  {
    id: "client-portal",
    name: "Client Portal",
    description: "Selbstbedienungsportal für Kunden: Verträge, Rechnungen, Status.",
    url: "https://portal.gentlegroup.studio",
    category: "customer",
    tags: ["kunden", "rechnungen", "verträge"],
  },
  {
    id: "support-desk",
    name: "Support Desk",
    description: "Ticketsystem für Kundenanfragen mit gemeinsamer Inbox.",
    url: "https://support.gentlegroup.studio",
    category: "customer",
    tags: ["support", "tickets", "inbox"],
  },
  {
    id: "design-library",
    name: "Design Library",
    description: "Zentrale Komponenten-, Token- und Asset-Bibliothek der Marke.",
    url: "https://design.gentlegroup.studio",
    category: "internal",
    tags: ["design system", "assets", "tokens"],
  },
  {
    id: "people-ops",
    name: "People Ops",
    description: "Urlaub, Zeiterfassung und interne Ressourcen für das Team.",
    url: "https://people.gentlegroup.studio",
    category: "internal",
    tags: ["hr", "urlaub", "zeiterfassung"],
  },
  {
    id: "status-monitor",
    name: "Status Monitor",
    description: "Live-Systemstatus, Uptime und Vorfälle über alle Produkte.",
    url: "https://status.gentlegroup.studio",
    category: "internal",
    tags: ["uptime", "incidents", "monitoring"],
  },
  {
    id: "api-console",
    name: "API Console",
    description: "API-Schlüssel verwalten, Requests testen, Logs einsehen.",
    url: "https://api-console.gentlegroup.studio",
    category: "internal",
    tags: ["api", "keys", "logs"],
    environment: "staging",
  },
  {
    id: "admin-console",
    name: "Admin Console",
    description: "Nutzer, Rollen und Mandanten für die gesamte Gentle Group verwalten.",
    url: "https://admin.gentlegroup.studio",
    category: "internal",
    tags: ["nutzer", "rollen", "mandanten"],
  },
];

/** Categories in use, in the fixed display order of CATEGORY_LABELS. */
export function getCategories(list: Application[] = applications): ApplicationCategory[] {
  const used = new Set(list.map((app) => app.category));
  return CATEGORY_ORDER.filter((category) => used.has(category));
}

/** Ids of applications marked as default favorites in the registry. */
export function getDefaultFavoriteIds(list: Application[] = applications): string[] {
  return list.filter((app) => app.isFavorite).map((app) => app.id);
}

/** Returns human-readable problems in the registry (duplicate ids, unsafe URLs). Empty when valid. */
export function validateApplications(list: Application[] = applications): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const app of list) {
    if (seen.has(app.id)) problems.push(`Doppelte id "${app.id}"`);
    seen.add(app.id);
    if (!isValidExternalUrl(app.url)) problems.push(`Ungültige URL bei "${app.id}": ${app.url}`);
    if (app.icon && !isValidIconSource(app.icon)) problems.push(`Ungültiges Icon bei "${app.id}": ${app.icon}`);
  }
  return problems;
}

/** Icons may be a root-relative path under /public or an absolute http(s) URL. */
export function isValidIconSource(icon: string): boolean {
  return (icon.startsWith("/") && !icon.startsWith("//")) || isValidExternalUrl(icon);
}

if (process.env.NODE_ENV === "development") {
  for (const problem of validateApplications()) console.warn(`[GentleHub] ${problem}`);
}
