export const API_URL = (process.env.GENTLEHUB_API_URL ?? "https://gentlehub.runasp.net").replace(/\/+$/, "");

export const SESSION_COOKIE = "gh_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export const KIND_LABELS = {
  internal: "Gentle Group",
  customer: "Kunde",
  project: "Eigenes Projekt",
} as const;

export const KIND_PATHS = {
  internal: "/apps",
  customer: "/customers",
  project: "/projects",
} as const;

export const KIND_SINGULAR = {
  internal: "App",
  customer: "Kunde",
  project: "Projekt",
} as const;

export const PROJECT_STATUSES = {
  live: {
    label: "Live",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
  },
  beta: {
    label: "Beta",
    dot: "bg-violet-500",
    badge: "bg-violet-50 text-violet-700 ring-violet-600/10 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20",
  },
  development: {
    label: "In Entwicklung",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 ring-amber-600/10 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
  },
  paused: {
    label: "Pausiert",
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-600 ring-slate-500/10 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-400/20",
  },
  archived: {
    label: "Archiviert",
    dot: "bg-rose-400",
    badge: "bg-rose-50 text-rose-700 ring-rose-600/10 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20",
  },
} as const;

export type StatusKey = keyof typeof PROJECT_STATUSES;

export const ACCENTS = [
  {
    key: "mint",
    label: "Mint",
    tile: "bg-[#ddfff1] text-[#006b49]",
    ring: "ring-[#a7f3d0]",
    soft: "bg-[#effff9]",
    dot: "bg-[#01c98a]",
  },
  {
    key: "violet",
    label: "Violett",
    tile: "bg-[#efe5ff] text-[#5b2bb8]",
    ring: "ring-[#d8c4ff]",
    soft: "bg-[#f7f1ff]",
    dot: "bg-[#9b6bff]",
  },
  {
    key: "blue",
    label: "Blau",
    tile: "bg-[#e4edff] text-[#214fae]",
    ring: "ring-[#bfd2ff]",
    soft: "bg-[#f0f5ff]",
    dot: "bg-[#5b8def]",
  },
  {
    key: "amber",
    label: "Amber",
    tile: "bg-[#fff1d8] text-[#8a5400]",
    ring: "ring-[#fcd9a0]",
    soft: "bg-[#fff8ec]",
    dot: "bg-[#f5a524]",
  },
  {
    key: "rose",
    label: "Rosé",
    tile: "bg-[#ffe4ea] text-[#9c2340]",
    ring: "ring-[#ffc2cf]",
    soft: "bg-[#fff2f5]",
    dot: "bg-[#f26d8d]",
  },
  {
    key: "cyan",
    label: "Cyan",
    tile: "bg-[#dcfaf7] text-[#006b63]",
    ring: "ring-[#9deee8]",
    soft: "bg-[#effcfb]",
    dot: "bg-[#2dd4bf]",
  },
] as const;

export function accentOf(key: string | null | undefined) {
  return ACCENTS.find((accent) => accent.key === key) ?? ACCENTS[0];
}

export const ASSET_GROUPS = [
  {
    key: "links",
    title: "Links & Websites",
    description: "Websites, Web-Apps und APIs",
    types: ["link"] as const,
  },
  {
    key: "repos",
    title: "Repositories",
    description: "Quellcode und Versionsverwaltung",
    types: ["repo"] as const,
  },
  {
    key: "infra",
    title: "Hosting & Datenbanken",
    description: "Server, Deployments und Datenbanken",
    types: ["hosting", "database"] as const,
  },
  {
    key: "accounts",
    title: "Zugänge & Konten",
    description: "Logins, Testkonten und Benutzer",
    types: ["account"] as const,
  },
  {
    key: "secrets",
    title: "Geheimnisse",
    description: "Verbindungen, Publish-Profile und Schlüssel",
    types: ["secret"] as const,
  },
] as const;

export const ASSET_TYPE_LABELS = {
  link: "Link",
  repo: "Repository",
  hosting: "Hosting",
  database: "Datenbank",
  account: "Zugang",
  secret: "Geheimnis",
} as const;

export const SUBTYPE_LABELS: Record<string, string> = {
  connection_string: "Connection String",
  publish_profile: "Publish Profile",
  api_key: "API-Schlüssel",
  license: "Lizenz",
  other: "Sonstiges",
};

export const ENVIRONMENTS = {
  production: {
    label: "Produktion",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
  },
  staging: {
    label: "Staging",
    badge: "bg-amber-50 text-amber-700 ring-amber-600/10 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
  },
  development: {
    label: "Entwicklung",
    badge: "bg-sky-50 text-sky-700 ring-sky-600/10 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20",
  },
} as const;

export const PROVIDER_SUGGESTIONS = [
  "Vercel",
  "GitHub",
  "GitLab",
  "MonsterASP",
  "Cloudflare",
  "Netlify",
  "IONOS",
  "Microsoft Azure",
  "MSSQL",
  "PostgreSQL",
  "MySQL",
  "Supabase",
];
