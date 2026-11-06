import type { Metadata } from "next";
import { getMonitoringData } from "@/lib/data";
import { formatRelative } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { AgentAvatar } from "@/components/ai/agent-avatar";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { MonitorCheckButton, MonitorList } from "@/components/ai/monitor-list";
import {
  IconAlert,
  IconCheck,
  IconGlobe,
  IconLock,
} from "@/components/ui/icons";

export const metadata: Metadata = { title: "Website-Wächter" };

export default async function MonitoringPage() {
  const { summary, targets } = await getMonitoringData();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4">
        <AgentAvatar
          agentId="website-monitor"
          size={88}
          state={summary.down > 0 ? "alert" : "idle"}
          title="Website-Wächter"
          className="hidden sm:block"
        />
        <div className="min-w-0 flex-1">
          <PageHeader
            eyebrow="AI Operations"
            title="Website-Wächter"
            description={`Prüft alle 5 Minuten die Websites eurer Live- und Beta-Projekte: Erreichbarkeit, Antwortzeit und SSL-Zertifikat. Fällt eine Seite zweimal hintereinander aus, kommt eine Telegram-Nachricht. Ohne KI, ohne laufende Kosten.${summary.lastRunAt ? ` Letzte Prüfung ${formatRelative(summary.lastRunAt)}.` : ""}`}
            action={<MonitorCheckButton />}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Überwacht"
          value={summary.total}
          hint="Live- und Beta-Projekte mit Website"
          icon={<IconGlobe className="h-4 w-4" />}
        />
        <StatCard
          label="Erreichbar"
          value={summary.up}
          hint="Letzte Prüfung erfolgreich"
          icon={<IconCheck className="h-4 w-4" />}
          tone="accent"
        />
        <StatCard
          label="Probleme"
          value={summary.down + summary.degraded}
          hint={`${summary.down} nicht erreichbar · ${summary.degraded} eingeschränkt`}
          icon={<IconAlert className="h-4 w-4" />}
        />
        <StatCard
          label="SSL bald fällig"
          value={summary.certExpiringSoon}
          hint="Ablauf in 14 Tagen oder früher"
          icon={<IconLock className="h-4 w-4" />}
        />
      </div>

      {targets.length === 0 ? (
        <EmptyState
          icon={<IconGlobe className="h-4 w-4" />}
          title="Keine Websites zum Überwachen"
          description="Sobald ein Projekt den Status Live oder Beta und eine Website-Adresse hat, erscheint es hier."
        />
      ) : (
        <MonitorList targets={targets} />
      )}

      <p className="text-[11px] leading-relaxed text-subtle">
        Geprüft wird die Website-Adresse aus dem Projekt. 401/403 (geschützte
        Seiten) gelten als erreichbar, 4xx als eingeschränkt, 5xx,
        Zeitüberschreitung und ungültige Zertifikate als nicht erreichbar.
        Interne Netzadressen werden nie abgefragt.
      </p>
    </div>
  );
}
