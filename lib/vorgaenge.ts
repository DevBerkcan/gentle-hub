import type { VorgangStage } from "@/lib/types";
import { agentName } from "@/lib/agent-personas";

/** The path of a customer request, in order. Shared by server pages and client components. */
export const VORGANG_STAGES: { key: VorgangStage; label: string; who: string }[] = [
  { key: "requirements", label: "Anforderungen", get who() { return `${agentName("project-notes")}`; } },
  { key: "estimate", label: "Schätzung", get who() { return `${agentName("estimation")}`; } },
  { key: "offer", label: "Angebot", get who() { return `${agentName("offer-contract")}`; } },
  { key: "offer_sent", label: "Angebot raus", get who() { return `${agentName("offer-contract")}`; } },
  { key: "build", label: "Bauauftrag", get who() { return `${agentName("frontend-plan")}, ${agentName("backend-plan")}, ${agentName("deployment")}`; } },
  { key: "live", label: "Live", get who() { return `${agentName("deployment")}`; } },
  { key: "invoiced", label: "Rechnung", get who() { return `${agentName("billing")}`; } },
];

export function stageIndex(stage: VorgangStage) {
  return Math.max(0, VORGANG_STAGES.findIndex((item) => item.key === stage));
}
