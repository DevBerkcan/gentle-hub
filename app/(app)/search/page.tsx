import type { Metadata } from "next";
import Link from "next/link";
import { getSearchData } from "@/lib/data";
import { shortUrl } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { ProjectGrid } from "@/components/projects/project-grid";
import { AssetTypeIcon } from "@/components/assets/asset-type-icon";
import { EmptyState } from "@/components/ui/empty-state";
import { EnvironmentBadge } from "@/components/ui/badge";
import { IconArrowRight, IconSearch } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Suche" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = (rawQuery ?? "").trim();

  const results = query.length >= 2 ? await getSearchData(query) : null;
  const projectCount = results?.projects.length ?? 0;
  const assetCount = results?.assets.length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Alles durchsuchen"
        title="Suche"
        description="Finde Apps, Kunden, Repositories, Hosting-Einträge und Zugänge an einem Ort."
      />

      <form action="/search" className="relative max-w-2xl" role="search">
        <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="z. B. Vercel, Skinbloom, Datenbank, Connection String …"
          aria-label="Suche"
          autoFocus={!query}
          className="h-12 w-full rounded-[14px] border border-line bg-surface pl-11 pr-28 text-[14px] text-ink shadow-card outline-none transition placeholder:text-subtle/80 focus:border-[#8fe6c3] focus:ring-4 focus:ring-[#d9fff0]"
        />
        <button type="submit" className="btn btn-primary absolute right-1.5 top-1/2 h-9 -translate-y-1/2">
          Suchen
          <IconArrowRight className="h-4 w-4" />
        </button>
      </form>

      {!results ? (
        <EmptyState
          icon={<IconSearch className="h-5 w-5" />}
          title={query ? "Mindestens 2 Zeichen eingeben" : "Wonach suchst du?"}
          description="Durchsuche Projektnamen, Beschreibungen, Repositories, Hosting-Anbieter, Benutzernamen und Notizen."
        />
      ) : projectCount === 0 && assetCount === 0 ? (
        <EmptyState
          icon={<IconSearch className="h-5 w-5" />}
          title={`Keine Treffer für „${query}“`}
          description="Prüfe die Schreibweise oder suche nach Anbieter, Kunde oder Eintragsbezeichnung."
          action={
            <Link href="/search" className="btn btn-secondary">
              Neue Suche
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-8">
          <p className="text-[11.5px] font-semibold uppercase tracking-wide text-subtle">
            {projectCount} {projectCount === 1 ? "Projekt" : "Projekte"} · {assetCount}{" "}
            {assetCount === 1 ? "Eintrag" : "Einträge"} für „{query}“
          </p>

          {projectCount > 0 && (
            <section aria-labelledby="search-projects">
              <h2 id="search-projects" className="mb-4 font-display text-[16px] font-bold text-ink">
                Projekte
              </h2>
              <ProjectGrid projects={results.projects.slice(0, 6)} />
            </section>
          )}

          {assetCount > 0 && (
            <section aria-labelledby="search-assets">
              <h2 id="search-assets" className="mb-4 font-display text-[16px] font-bold text-ink">
                Einträge
              </h2>
              <div className="card divide-y divide-line overflow-hidden">
                {results.assets.map(({ asset, project }) => (
                  <Link
                    key={asset.id}
                    href={`/p/${project.slug}#asset-${asset.id}`}
                    className="flex items-start gap-3 px-4 py-3.5 transition hover:bg-surface-2"
                  >
                    <AssetTypeIcon type={asset.type} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[12.5px] font-semibold text-ink">{asset.label}</p>
                        {asset.provider && (
                          <span className="text-[10px] font-semibold text-muted">{asset.provider}</span>
                        )}
                        <EnvironmentBadge environment={asset.environment} />
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-muted">
                        {project.name}
                        {asset.url ? ` · ${shortUrl(asset.url)}` : ""}
                        {asset.username ? ` · ${asset.username}` : ""}
                      </p>
                    </div>
                    <span className="mt-1 shrink-0 text-[10.5px] font-semibold text-subtle">
                      Öffnen →
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
