import Link from "next/link";
import { cn } from "@/lib/cn";
import { PROJECT_STATUSES, type StatusKey } from "@/lib/constants";
import type { Project, ProjectStatus } from "@/lib/types";
import { IconStarFilled } from "@/components/ui/icons";

export function ProjectFilterBar({
  basePath,
  projects,
  activeStatus,
  favoritesOnly,
}: {
  basePath: string;
  projects: Project[];
  activeStatus?: ProjectStatus;
  favoritesOnly?: boolean;
}) {
  const favorites = projects.filter((project) => project.isFavorite).length;
  const statusCounts = projects.reduce<Partial<Record<ProjectStatus, number>>>((counts, project) => {
    counts[project.status] = (counts[project.status] ?? 0) + 1;
    return counts;
  }, {});

  const statuses = (Object.keys(PROJECT_STATUSES) as StatusKey[]).filter(
    (status) => (statusCounts[status] ?? 0) > 0,
  );

  const chipClass = (active: boolean) =>
    cn(
      "inline-flex h-8 items-center gap-1.5 rounded-[6px] border px-2.5 text-[11px] font-semibold transition",
      active
        ? "border-ink bg-ink text-white"
        : "border-line bg-white text-muted hover:border-line-strong hover:text-ink",
    );

  return (
    <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1">
      <Link href={basePath} className={chipClass(!activeStatus && !favoritesOnly)}>
        Alle
        <span className={cn("tabular-nums", activeStatus || favoritesOnly ? "text-subtle" : "text-white/60")}>
          {projects.length}
        </span>
      </Link>

      <Link
        href={`${basePath}?favorite=1`}
        className={chipClass(Boolean(favoritesOnly))}
      >
        <IconStarFilled className={cn("h-3 w-3", favoritesOnly ? "text-amber-300" : "text-amber-500")} />
        Favoriten
        <span className={cn("tabular-nums", favoritesOnly ? "text-white/60" : "text-subtle")}>
          {favorites}
        </span>
      </Link>

      <span className="mx-1 h-4 w-px shrink-0 bg-line" aria-hidden="true" />

      {statuses.map((status) => {
        const active = activeStatus === status;
        const meta = PROJECT_STATUSES[status];
        return (
          <Link
            key={status}
            href={`${basePath}?status=${status}`}
            className={chipClass(active)}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
            {meta.label}
            <span className={cn("tabular-nums", active ? "text-white/60" : "text-subtle")}>
              {statusCounts[status]}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
