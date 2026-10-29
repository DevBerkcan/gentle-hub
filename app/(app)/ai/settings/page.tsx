import type { Metadata } from "next";
import { getAiOverviewData } from "@/lib/data";
import { PageHeader } from "@/components/ui/page-header";
import { AiSettingsForm } from "@/components/ai/ai-settings-form";
import { IconShield } from "@/components/ui/icons";

export const metadata: Metadata = { title: "AI-Einstellungen" };

export default async function AiSettingsPage() {
  const { settings } = await getAiOverviewData();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="AI Operations"
        title="Einstellungen"
        description="Globales Budget, Not-Aus und Status des KI-Anbieters."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <AiSettingsForm settings={settings} />

        <aside className="flex flex-col gap-5">
          <section className="card p-4">
            <h2 className="text-[12.5px] font-semibold text-ink">KI-Anbieter</h2>
            <p className="mt-2 text-[12px] text-ink">
              <span className="font-mono">{settings.provider}</span>
              {settings.isDryRun && <span className="ml-2 text-muted">(Testmodus, keine Kosten)</span>}
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">
              Anbieter, Modell und API-Key werden ausschließlich serverseitig konfiguriert und nie im Browser gespeichert.
            </p>
          </section>
          <section className="card p-4">
            <div className="flex items-center gap-2 text-[11.5px] font-semibold text-ink">
              <IconShield className="h-3.5 w-3.5 text-accent" />
              Schutzmechanismen
            </div>
            <ul className="mt-2.5 flex flex-col gap-1.5 text-[10.5px] leading-relaxed text-muted">
              <li>E-Mail-Inhalte gelten als nicht vertrauenswürdige Daten und können keine Anweisungen ändern.</li>
              <li>Agenten nutzen nur freigegebene Werkzeuge, nie den Zugangsdaten-Tresor.</li>
              <li>Nichts wird ohne ausdrückliche Freigabe nach außen versendet.</li>
              <li>Jobs laufen aus SQL Server und überstehen Neustarts des Servers.</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
