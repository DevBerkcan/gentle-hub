import type { Metadata } from "next";
import Link from "next/link";
import { getProjectsData } from "@/lib/data";
import { PROJECT_STATUSES } from "@/lib/constants";
import { sortProjects } from "@/lib/sort";
import type { ProjectStatus } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { NewProjectButton } from "@/components/projects/new-project-button";
import { ProjectFilterBar } from "@/components/projects/filter-bar";
import { ProjectGrid } from "@/components/projects/project-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { IconFilter, IconFolder } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Eigene Projekte" };

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[]; favorite?: string | string[] }>;
}) {
  const params = await searchParams;
  const projects = sortProjects("project", await getProjectsData("project"));

  const rawStatus = Array.isArray(params.status) ? params.status[0] : params.status;
  const status =
    rawStatus && rawStatus in PROJECT_STATUSES ? (rawStatus as ProjectStatus) : undefined;
  const favoritesOnly = (Array.isArray(params.favorite) ? params.favorite[0] : params.favorite) === "1";

  const filtered = projects.filter((project) => {
    if (favoritesOnly && !project.isFavorite) return false;
    if (status && project.status !== status) return false;
    return true;
  });

  const isFiltered = Boolean(status || favoritesOnly);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Unabhängig von Gentle Group"
        title="Eigene Projekte"
        description="Games, Experimente, Portfolios und Werkzeuge, die nicht zu den Gentle-Group-Produkten oder Kundenprojekten gehören."
        action={<NewProjectButton kind="project" label="Neues Projekt" />}
      />

      <ProjectFilterBar
        basePath="/projects"
        projects={projects}
        activeStatus={status}
        favoritesOnly={favoritesOnly}
      />

      <div className="flex items-center justify-between gap-3">
        <p className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-subtle">
          <IconFilter className="h-3 w-3" />
          {filtered.length} von {projects.length} Projekten
        </p>
        {isFiltered && (
          <Link href="/projects" className="text-[11px] font-semibold text-muted transition hover:text-ink">
            Filter zurücksetzen
          </Link>
        )}
      </div>

      {filtered.length > 0 ? (
        <ProjectGrid projects={filtered} />
      ) : (
        <EmptyState
          icon={<IconFolder className="h-4 w-4" />}
          title={isFiltered ? "Keine Projekte für diesen Filter" : "Noch keine eigenen Projekte"}
          description={
            isFiltered
              ? "Passe den Filter an oder setze ihn zurück."
              : "Lege das erste eigene Projekt an."
          }
          action={
            isFiltered ? (
              <Link href="/projects" className="btn btn-secondary">
                Filter zurücksetzen
              </Link>
            ) : (
              <NewProjectButton kind="project" label="Erstes Projekt anlegen" />
            )
          }
        />
      )}
    </div>
  );
}
