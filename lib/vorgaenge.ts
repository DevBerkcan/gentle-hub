import type { VorgangStage } from "@/lib/types";

/** The path of a customer request, in order. Shared by server pages and client components. */
export const VORGANG_STAGES: { key: VorgangStage; label: string; who: string }[] = [
  { key: "requirements", label: "Anforderungen", who: "Defne" },
  { key: "estimate", label: "Schätzung", who: "Emre" },
  { key: "offer", label: "Angebot", who: "Marie" },
  { key: "offer_sent", label: "Angebot raus", who: "Du" },
  { key: "build", label: "Bauauftrag", who: "Baran, Onur, Tolga" },
  { key: "live", label: "Live", who: "Tolga" },
];

export function stageIndex(stage: VorgangStage) {
  return Math.max(0, VORGANG_STAGES.findIndex((item) => item.key === stage));
}
