import type { Metadata } from "next";
import Link from "next/link";
import { getProjectsData } from "@/lib/data";
import { PROJECT_STATUSES } from "@/lib/constants";
import type { ProjectStatus } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { NewProjectButton } from "@/components/projects/new-project-button";
import { ProjectFilterBar } from "@/components/projects/filter-bar";
import { ProjectGrid } from "@/components/projects/project-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { IconFilter, IconUsers } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Kundenprojekte" };

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[]; favorite?: string | string[] }>;
}) {
  const params = await searchParams;
  const projects = await getProjectsData("customer");

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
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Für Kunden entwickelt"
        title="Kundenprojekte"
        description="Alle Websites, Web-Apps und Systeme, die wir für Kunden umgesetzt haben – inklusive Repositories, Hosting und sensibler Zugänge."
        action={<NewProjectButton kind="customer" label="Neuer Kunde" />}
      />

      <ProjectFilterBar
        basePath="/customers"
        projects={projects}
        activeStatus={status}
        favoritesOnly={favoritesOnly}
      />

      <div className="flex items-center justify-between gap-3">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-subtle">
          <IconFilter className="h-3.5 w-3.5" />
          {filtered.length} von {projects.length} Kunden
        </p>
        {isFiltered && (
          <Link
            href="/customers"
            className="text-[11.5px] font-semibold text-muted transition hover:text-ink"
          >
            Filter zurücksetzen
          </Link>
        )}
      </div>

      {filtered.length > 0 ? (
        <ProjectGrid projects={filtered} />
      ) : (
        <EmptyState
          icon={<IconUsers className="h-5 w-5" />}
          title={isFiltered ? "Keine Kunden für diesen Filter" : "Noch keine Kundenprojekte"}
          description={
            isFiltered
              ? "Passe den Filter an oder setze ihn zurück, um alle Kunden zu sehen."
              : "Lege den ersten Kunden an und hinterlege Website, Repositories, Hosting und Zugänge."
          }
          action={
            isFiltered ? (
              <Link href="/customers" className="btn btn-secondary">
                Filter zurücksetzen
              </Link>
            ) : (
              <NewProjectButton kind="customer" label="Ersten Kunden anlegen" variant="primary" />
            )
          }
        />
      )}
    </div>
  );
}
