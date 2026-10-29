import type { Metadata } from "next";
import { getAiAgentsData } from "@/lib/data";
import { PageHeader } from "@/components/ui/page-header";
import { AgentCard } from "@/components/ai/agent-card";

export const metadata: Metadata = { title: "Agenten" };

export default async function AiAgentsPage() {
  const agents = await getAiAgentsData();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="AI Operations"
        title="Agenten"
        description="Serverseitig ausgeführte Agenten mit versionierten Systemanweisungen, Berechtigungen, Budget und Ausführungshistorie."
      />
      <div className="grid gap-3 lg:grid-cols-2">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
