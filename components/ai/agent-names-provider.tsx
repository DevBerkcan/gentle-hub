"use client";

import { setAgentNames } from "@/lib/agent-personas";

/** Makes the custom agent names available to client components before they render. */
export function AgentNamesProvider({ names, children }: { names: Record<string, string>; children: React.ReactNode }) {
  setAgentNames(names);
  return <>{children}</>;
}
