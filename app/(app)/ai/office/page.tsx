import type { Metadata } from "next";
import { getOfficeData } from "@/lib/data";
import { PageHeader } from "@/components/ui/page-header";
import { AgentOffice } from "@/components/ai/office/agent-office";

export const metadata: Metadata = { title: "Agenten-Büro" };

export default async function AgentOfficePage() {
  const { rooms, flows } = await getOfficeData();

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="AI Operations"
        title="Agenten-Büro"
        description="Alle Agenten in ihren Abteilungen. Wer gerade arbeitet, sitzt am Schreibtisch; die Lichtbahnen zeigen, wie Anfragen von Raum zu Raum weiterwandern. Klick auf einen Raum oder Agenten öffnet die Details."
      />
      <AgentOffice rooms={rooms} flows={flows} height="min(72vh, 760px)" />
    </div>
  );
}
