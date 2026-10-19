import Link from "next/link";
import { getOverviewData, getProjectsData } from "@/lib/data";
import { requireAuth } from "@/lib/session";
import { todayLabel } from "@/lib/format";
import { sortProjects } from "@/lib/sort";
import { ProjectGrid } from "@/components/projects/project-grid";
import { SectionHeader } from "@/components/projects/section-header";
import { NewProjectButton } from "@/components/projects/new-project-button";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import {
  IconApps,
  IconArrowRight,
  IconDatabase,
  IconFolder,
  IconKey,
  IconLink,
  IconServer,
  IconUsers,
} from "@/components/ui/icons";

export default async function DashboardPage() {
  await requireAuth();
  const [overview, internal, customers, ownProjects] = await Promise.all([
    getOverviewData(),
    getProjectsData("internal"),
    getProjectsData("customer"),
    getProjectsData("project"),
  ]);

  const counts = overview.counts;
  const favorites = overview.favorites;
  const internalSorted = sortProjects("internal", internal);
  const customersSorted = sortProjects("customer", customers);
  const projectsSorted = sortProjects("project", ownProjects);
  const allProjects = [...internal, ...customers, ...ownProjects];
  const statusSummary = [
    { key: "live", label: "Live", color: "bg-emerald-500", count: allProjects.filter((project) => project.status === "live").length },
    { key: "development", label: "In Entwicklung", color: "bg-amber-500", count: allProjects.filter((project) => project.status === "development").length },
    { key: "paused", label: "Pausiert", color: "bg-slate-400", count: allProjects.filter((project) => project.status === "paused").length },
    { key: "archived", label: "Archiviert", color: "bg-rose-400", count: allProjects.filter((project) => project.status === "archived").length },
  ];

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        eyebrow="Gentle Group"
        title={`Übersicht`}
        description={`${todayLabel()} · ${counts.internal} Apps, ${counts.customers} Kunden und ${counts.projects} eigene Projekte im Hub.`}
        action={
          <>
            <NewProjectButton kind="internal" label="Neue App" />
            <NewProjectButton kind="customer" label="Neuer Kunde" variant="secondary" />
            <Link
              href="/search"
              className="btn btn-ghost"
              aria-label="Alle Projekte durchsuchen"
            >
              Suchen
              <IconArrowRight className="h-3.5 w-3.5" />
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="Gentle Group"
          value={counts.internal}
          hint="Produkte, Plattformen und interne Tools"
          icon={<IconApps className="h-4 w-4" />}
          href="/apps"
          tone="accent"
        />
        <StatCard
          label="Kunden"
          value={counts.customers}
          hint="Websites, Shops und Anwendungen"
          icon={<IconUsers className="h-4 w-4" />}
          href="/customers"
        />
        <StatCard
          label="Eigene Projekte"
          value={counts.projects}
          hint="Games, Experimente und Portfolios"
          icon={<IconFolder className="h-4 w-4" />}
          href="/projects"
        />
        <StatCard
          label="Einträge gesamt"
          value={counts.assets}
          hint={`${counts.repositories} Repos · ${counts.hostings} Hostings · ${counts.secrets} Secrets`}
          icon={<IconLink className="h-4 w-4" />}
        />
      </div>

      {favorites.length > 0 && (
        <section aria-labelledby="favorites-heading">
          <SectionHeader
            title="Schnellzugriff"
            description="Deine favorisierten Projekte."
            href="/apps?favorite=1"
            linkLabel="Alle Favoriten"
          />
          <ProjectGrid projects={favorites.slice(0, 4)} compact />
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_318px]">
        <div className="flex flex-col gap-7">
          <section aria-labelledby="internal-heading">
            <SectionHeader
              title="Gentle Group"
              description="Eigene Produkte und interne Werkzeuge."
              href="/apps"
            />
            <ProjectGrid projects={internalSorted.slice(0, 6)} />
          </section>

          <section aria-labelledby="customers-heading">
            <SectionHeader
              title="Kundenprojekte"
              description="Für Kunden entwickelte Websites und Anwendungen."
              href="/customers"
            />
            <ProjectGrid projects={customersSorted.slice(0, 6)} />
          </section>

          <section aria-labelledby="projects-heading">
            <SectionHeader
              title="Eigene Projekte"
              description="Games, Experimente und Portfolios außerhalb der Gentle Group."
              href="/projects"
            />
            <ProjectGrid projects={projectsSorted.slice(0, 3)} />
          </section>
        </div>

        <aside className="flex flex-col gap-4">
          <section className="card p-4" aria-labelledby="status-heading">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="status-heading" className="text-[12.5px] font-semibold text-ink">
                Projektstatus
              </h2>
              <span className="text-[9.5px] font-semibold uppercase tracking-wide text-subtle">
                {allProjects.length}
              </span>
            </div>
            <div className="flex h-1.5 overflow-hidden rounded-full bg-surface-2">
              {statusSummary.map((status) => (
                <span
                  key={status.key}
                  className={status.color}
                  style={{ width: `${allProjects.length > 0 ? (status.count / allProjects.length) * 100 : 0}%` }}
                />
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
              {statusSummary.map((status) => (
                <div key={status.key} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-[10.5px] text-muted">
                    <span className={`h-1.5 w-1.5 rounded-full ${status.color}`} />
                    {status.label}
                  </span>
                  <span className="text-[11px] font-semibold tabular-nums text-ink">{status.count}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-4" aria-labelledby="activity-heading">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 id="activity-heading" className="text-[12.5px] font-semibold text-ink">
                Aktivität
              </h2>
              <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-emerald-700">
                <span className="h-1 w-1 rounded-full bg-emerald-500" />
                Live
              </span>
            </div>
            <ActivityFeed items={overview.recentActivity} />
          </section>

          <section className="card overflow-hidden" aria-labelledby="infra-heading">
            <div className="border-b border-line px-4 py-2.5">
              <h2 id="infra-heading" className="text-[12.5px] font-semibold text-ink">
                Infrastruktur
              </h2>
            </div>
            <div className="grid grid-cols-2 divide-x divide-y divide-line">
              <InfraStat icon={<IconServer className="h-3 w-3" />} label="Hostings" value={counts.hostings} />
              <InfraStat icon={<IconDatabase className="h-3 w-3" />} label="Datenbanken" value={counts.databases} />
              <InfraStat icon={<IconKey className="h-3 w-3" />} label="Konten" value={counts.accounts} />
              <InfraStat icon={<IconApps className="h-3 w-3" />} label="Repos" value={counts.repositories} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function InfraStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex flex-col gap-0.5 px-3.5 py-2.5">
      <span className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-subtle">
        <span className="text-muted">{icon}</span>
        {label}
      </span>
      <span className="font-display text-[15px] font-semibold tabular-nums text-ink">{value}</span>
    </div>
  );
}
