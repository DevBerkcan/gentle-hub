import type { Metadata } from "next";
import { getReportsData } from "@/lib/data";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { AgentAvatar } from "@/components/ai/agent-avatar";
import { ReportList } from "@/components/ai/report-list";
import { IconActivity } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Kundenberichte" };

export default async function ReportsPage() {
  const { items, defaultMonth } = await getReportsData();
  const maintenance = items.filter((item) => item.isMaintenance).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4">
        <AgentAvatar agentId="customer-report" size={88} title="Aylin · Kundenberichte" className="hidden sm:block" />
        <div className="min-w-0 flex-1">
          <PageHeader
            eyebrow="AI Operations"
            title="Kundenberichte"
            description={`Aylin schreibt euren Kunden einen Monatsbericht: Erreichbarkeit, Antwortzeit, SSL und Support-Anfragen der Website, mit kurzer Einordnung. Projekte mit dem Tag „wartung“ (${maintenance}) bekommen ihn zum Monatsanfang automatisch als Entwurf; gesendet wird erst nach deiner Freigabe.`}
          />
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<IconActivity className="h-4 w-4" />}
          title="Keine Live-Projekte"
          description="Berichte gibt es für Projekte mit Status Live oder Beta."
        />
      ) : (
        <ReportList projects={items} month={defaultMonth} />
      )}

      <p className="text-[11px] leading-relaxed text-subtle">
        Die Zahlen kommen vom Website-Wächter und aus den Support-Tickets des Monats. Ohne Messwerte und Tickets entsteht kein Bericht.
        Für den automatischen Versand im Projekt das Tag „wartung“ setzen und eine Kontakt-E-Mail hinterlegen.
      </p>
    </div>
  );
}
