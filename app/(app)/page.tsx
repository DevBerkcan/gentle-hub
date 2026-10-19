import Link from "next/link";
import { getOverviewData, getProjectsData } from "@/lib/data";
import { requireAuth } from "@/lib/session";
import { formatRelative, greetingFor, todayLabel } from "@/lib/format";
import type { OverviewCounts } from "@/lib/types";
import { ProjectGrid } from "@/components/projects/project-grid";
import { SectionHeader } from "@/components/projects/section-header";
import { NewProjectButton } from "@/components/projects/new-project-button";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ProjectIcon } from "@/components/ui/project-icon";
import {
  IconApps,
  IconArrowRight,
  IconChevronRight,
  IconDatabase,
  IconKey,
  IconLink,
  IconLock,
  IconServer,
  IconUsers,
} from "@/components/ui/icons";

export default async function DashboardPage() {
  const { user } = await requireAuth();
  const [overview, internal, customers] = await Promise.all([
    getOverviewData(),
    getProjectsData("internal"),
    getProjectsData("customer"),
  ]);

  const counts = overview.counts;
  const favorites = overview.favorites;

  return (
    <div className="flex flex-col gap-8">
      <Hero name={user.displayName} counts={counts} />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="Eigene Apps"
          value={counts.internal}
          hint="Produkte, Websites und interne Tools"
          icon={<IconApps className="h-4 w-4" />}
          href="/apps"
          tone="mint"
        />
        <StatCard
          label="Kunden"
          value={counts.customers}
          hint="Projekte, die wir für andere entwickeln"
          icon={<IconUsers className="h-4 w-4" />}
          href="/customers"
          tone="violet"
        />
        <StatCard
          label="Einträge gesamt"
          value={counts.assets}
          hint={`${counts.repositories} Repos · ${counts.hostings} ${counts.hostings === 1 ? "Hosting" : "Hostings"} · ${counts.databases} ${counts.databases === 1 ? "DB" : "DBs"}`}
          icon={<IconLink className="h-4 w-4" />}
          tone="blue"
        />
        <StatCard
          label="Geheimnisse"
          value={counts.secrets}
          hint="Passwörter, Keys und Verbindungen"
          icon={<IconLock className="h-4 w-4" />}
          tone="rose"
        />
      </div>

      {favorites.length > 0 && (
        <section aria-labelledby="favorites-heading">
          <SectionHeader
            title="Favoriten"
            description="Deine wichtigsten Projekte für den schnellen Zugriff."
            href="/apps?favorite=1"
          />
          <ProjectGrid projects={favorites.slice(0, 4)} compact />
        </section>
      )}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_350px]">
        <div className="flex flex-col gap-8">
          <section aria-labelledby="internal-heading">
            <SectionHeader
              title="Gentle Group"
              description="Eigene Produkte, Websites und interne Werkzeuge."
              href="/apps"
            />
            <ProjectGrid projects={internal.slice(0, 6)} />
          </section>

          <section aria-labelledby="customers-heading">
            <SectionHeader
              title="Kundenprojekte"
              description="Websites und Anwendungen, die wir für Kunden entwickelt haben."
              href="/customers"
            />
            <ProjectGrid projects={customers.slice(0, 3)} />
          </section>
        </div>

        <aside className="flex flex-col gap-5">
          <section className="card p-4" aria-labelledby="recent-heading">
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 id="recent-heading" className="font-display text-[13px] font-bold text-ink">
                Zuletzt aktualisiert
              </h2>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-subtle">
                {overview.recentProjects.length}
              </span>
            </div>
            <div className="flex flex-col">
              {overview.recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/p/${project.slug}`}
                  className="group flex items-center gap-2.5 rounded-[10px] px-2 py-2 transition hover:bg-surface-2"
                >
                  <ProjectIcon
                    name={project.name}
                    icon={project.icon}
                    accent={project.accent}
                    size="sm"
                    className="h-8 w-8 rounded-[9px] text-[14px]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-semibold text-ink">
                      {project.name}
                    </span>
                    <span className="block text-[10px] text-muted">
                      {project.kind === "customer" ? "Kunde" : "App"} · {formatRelative(project.updatedAt)}
                    </span>
                  </span>
                  <IconChevronRight className="h-3.5 w-3.5 shrink-0 text-subtle transition group-hover:translate-x-0.5 group-hover:text-ink" />
                </Link>
              ))}
            </div>
          </section>

          <section className="card p-4" aria-labelledby="activity-heading">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 id="activity-heading" className="font-display text-[13px] font-bold text-ink">
                Aktivität
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
                Live
              </span>
            </div>
            <ActivityFeed items={overview.recentActivity} />
          </section>

          <section className="card overflow-hidden" aria-labelledby="infra-heading">
            <div className="border-b border-line px-4 py-3">
              <h2 id="infra-heading" className="font-display text-[13px] font-bold text-ink">
                Infrastruktur
              </h2>
            </div>
            <div className="grid grid-cols-2 divide-x divide-y divide-line">
              <InfraStat icon={<IconServer className="h-3.5 w-3.5" />} label="Hostings" value={counts.hostings} />
              <InfraStat icon={<IconDatabase className="h-3.5 w-3.5" />} label="Datenbanken" value={counts.databases} />
              <InfraStat icon={<IconKey className="h-3.5 w-3.5" />} label="Konten" value={counts.accounts} />
              <InfraStat icon={<IconApps className="h-3.5 w-3.5" />} label="Repos" value={counts.repositories} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Hero({ name, counts }: { name: string; counts: OverviewCounts }) {
  return (
    <section className="relative overflow-hidden rounded-[26px] bg-navy text-white shadow-[0_30px_70px_-30px_rgb(5_9_28/0.6)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(38rem_24rem_at_100%_0%,rgb(169_122_255/0.28),transparent_60%),radial-gradient(34rem_22rem_at_0%_100%,rgb(1_255_169/0.16),transparent_60%)]" />
      <div className="grid-pattern pointer-events-none absolute inset-0 opacity-50" />
      <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-center lg:p-9">
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/45">
            {todayLabel()}
          </p>
          <h1 className="mt-3 max-w-2xl text-balance font-display text-[30px] font-extrabold leading-[1.06] tracking-[-0.035em] sm:text-[38px]">
            {greetingFor(name)}.
          </h1>
          <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-white/55 sm:text-[14.5px]">
            Alle Apps, Kundenprojekte, Repositories und Zugänge der Gentle Group – zentral,
            aufgeräumt und einen Klick entfernt.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <NewProjectButton kind="internal" label="Neue App" variant="mint" className="h-10" />
            <NewProjectButton
              kind="customer"
              label="Neuer Kunde"
              variant="ghost"
              className="h-10 border border-white/15 bg-white/[0.07] text-white hover:bg-white/[0.12] hover:text-white"
            />
            <Link
              href="/apps"
              className="inline-flex h-10 items-center gap-1.5 rounded-[12px] px-3 text-[12.5px] font-semibold text-white/65 transition hover:text-white"
            >
              Alle Apps
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="rounded-[20px] border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-[9.5px] font-bold uppercase tracking-[0.14em] text-white/40">
              <span className="h-1.5 w-1.5 rounded-full bg-mint animate-pulse-dot" />
              Systemstatus
            </div>
            <p className="mt-2 font-display text-[24px] font-extrabold tracking-tight text-white">
              Online
            </p>
            <p className="text-[10.5px] text-white/45">API und Datenbank verbunden</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-[11px] border border-white/[0.07] bg-white/[0.04] px-3 py-2.5">
                <p className="font-display text-[19px] font-extrabold leading-none text-mint">
                  {counts.internal}
                </p>
                <p className="mt-1 text-[9px] font-semibold uppercase tracking-wide text-white/40">
                  Apps
                </p>
              </div>
              <div className="rounded-[11px] border border-white/[0.07] bg-white/[0.04] px-3 py-2.5">
                <p className="font-display text-[19px] font-extrabold leading-none text-white">
                  {counts.customers}
                </p>
                <p className="mt-1 text-[9px] font-semibold uppercase tracking-wide text-white/40">
                  Kunden
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
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
    <div className="flex flex-col gap-1 px-4 py-3">
      <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-subtle">
        <span className="text-muted">{icon}</span>
        {label}
      </span>
      <span className="font-display text-[18px] font-extrabold tabular-nums text-ink">{value}</span>
    </div>
  );
}
