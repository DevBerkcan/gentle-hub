/** Each agent has a first name and a short role, so the team feels like colleagues. */
export type AgentPersona = { firstName: string; role: string };

export const AGENT_PERSONAS: Record<string, AgentPersona> = {
  "email-intelligence": { firstName: "Elif", role: "E-Mail-Analyse" },
  "crm-matching": { firstName: "Kerem", role: "CRM-Zuordnung" },
  "lead-check": { firstName: "Selin", role: "Lead-Check" },
  "project-notes": { firstName: "Defne", role: "Projektnotizen" },
  estimation: { firstName: "Emre", role: "Pauschal-Schätzung" },
  "reply-drafter": { firstName: "Zeynep", role: "Kundenantworten" },
  "follow-up": { firstName: "Burak", role: "Nachfassen" },
  "support-triage": { firstName: "Mert", role: "Support" },
  "website-monitor": { firstName: "Kaan", role: "Website-Wächter" },
  "customer-report": { firstName: "Aylin", role: "Kundenberichte" },
  "voice-notes": { firstName: "Deniz", role: "Sprachnotizen" },
  "daily-briefing": { firstName: "Leyla", role: "Tagesbriefing" },
  "draft-review": { firstName: "Ece", role: "Qualitätsprüfung" },
};

export function persona(agentId: string | null | undefined, fallbackName?: string): AgentPersona {
  return (agentId && AGENT_PERSONAS[agentId]) || { firstName: fallbackName ?? "Agent", role: fallbackName ?? "" };
}

/** "Zeynep · Kundenantworten" */
export function personaLabel(agentId: string | null | undefined, fallbackName?: string) {
  const p = persona(agentId, fallbackName);
  return p.role ? `${p.firstName} · ${p.role}` : p.firstName;
}
