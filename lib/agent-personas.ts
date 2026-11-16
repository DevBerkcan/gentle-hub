/** Each agent has a first name and a short role, so the team feels like colleagues. */
export type TeamKey = "projektleitung" | "entwicklung" | "buero" | "vertrieb";

export type AgentPersona = { firstName: string; role: string; team?: TeamKey };

export const TEAMS: { key: TeamKey; title: string; description: string }[] = [
  {
    key: "projektleitung",
    title: "Projektleitung",
    description: "Nimmt die Anfrage an, schreibt die Anforderungen, schätzt und berichtet dem Kunden.",
  },
  {
    key: "entwicklung",
    title: "Entwicklung",
    description: "Plant Frontend, Backend und Deployment als Bauauftrag für Claude Code und prüft vor dem Go-Live.",
  },
  {
    key: "buero",
    title: "Büro",
    description: "Liest E-Mails, ordnet Kunden zu, schreibt Antworten, fasst nach und hält den Tag zusammen.",
  },
  {
    key: "vertrieb",
    title: "Vertrieb",
    description: "Findet Firmen in der Umgebung, prüft ihre Website und bereitet die Ansprache vor.",
  },
];

export const AGENT_PERSONAS: Record<string, AgentPersona> = {
  "project-notes": { firstName: "Defne", role: "Anforderungen", team: "projektleitung" },
  estimation: { firstName: "Emre", role: "Pauschal-Schätzung", team: "projektleitung" },
  "customer-report": { firstName: "Aylin", role: "Kundenberichte", team: "projektleitung" },
  "frontend-plan": { firstName: "Baran", role: "Frontend", team: "entwicklung" },
  "backend-plan": { firstName: "Onur", role: "Backend", team: "entwicklung" },
  deployment: { firstName: "Tolga", role: "Deployment", team: "entwicklung" },
  "website-monitor": { firstName: "Kaan", role: "Website-Wächter", team: "entwicklung" },
  "email-intelligence": { firstName: "Elif", role: "E-Mail-Analyse", team: "buero" },
  "crm-matching": { firstName: "Kerem", role: "CRM-Zuordnung", team: "buero" },
  "reply-drafter": { firstName: "Marie", role: "Kundenantworten", team: "buero" },
  "follow-up": { firstName: "Burak", role: "Nachfassen", team: "buero" },
  "support-triage": { firstName: "Mert", role: "Support", team: "buero" },
  "voice-notes": { firstName: "Deniz", role: "Sprachnotizen", team: "buero" },
  "draft-review": { firstName: "Ece", role: "Qualitätsprüfung", team: "buero" },
  "daily-briefing": { firstName: "Leyla", role: "Tagesbriefing", team: "buero" },
  "lead-finder": { firstName: "Arda", role: "Lead-Finder", team: "vertrieb" },
  "lead-check": { firstName: "Selin", role: "Lead-Check", team: "vertrieb" },
  outreach: { firstName: "Cem", role: "Ansprache", team: "vertrieb" },
};

export const PLANNED_PERSONAS: Record<string, AgentPersona> = {
  "offer-contract": { firstName: "Can", role: "Angebot & Vertrag", team: "projektleitung" },
  "project-control": { firstName: "Esra", role: "Projektsteuerung", team: "projektleitung" },
  billing: { firstName: "Melis", role: "Abrechnung", team: "projektleitung" },
};

/** Colleagues without an AI agent of their own: they work without AI or come with phase 2. */
export const TEAM_EXTRAS: { id: string; href?: string; note: string; planned?: boolean }[] = [
  { id: "offer-contract", note: "Erstellt Angebot und Vertrag in GentleSuite. Kommt in Phase 2.", planned: true },
  { id: "project-control", note: "Legt Projekt und Meilensteine in GentleSuite an. Kommt in Phase 2.", planned: true },
  { id: "billing", note: "Bereitet die Rechnung vor, wenn der Auftrag fertig ist. Kommt in Phase 2.", planned: true },
  { id: "website-monitor", href: "/ai/monitoring", note: "Prüft alle Websites regelmäßig, ganz ohne KI." },
  { id: "lead-finder", href: "/ai/leads", note: "Sucht Firmen über Google Places, ganz ohne KI." },
];

export function persona(agentId: string | null | undefined, fallbackName?: string): AgentPersona {
  return (
    (agentId && (AGENT_PERSONAS[agentId] ?? PLANNED_PERSONAS[agentId])) || {
      firstName: fallbackName ?? "Agent",
      role: fallbackName ?? "",
    }
  );
}

/** "Marie · Kundenantworten" */
export function personaLabel(agentId: string | null | undefined, fallbackName?: string) {
  const p = persona(agentId, fallbackName);
  return p.role ? `${p.firstName} · ${p.role}` : p.firstName;
}
