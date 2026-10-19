import Link from "next/link";
import { cn } from "@/lib/cn";
import type { Project } from "@/lib/types";
import { projectPath } from "@/lib/format";
import { ProjectIcon } from "@/components/ui/project-icon";
import { StatusBadge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/projects/favorite-button";
import { IconArrowUpRight, IconKey, IconLink } from "@/components/ui/icons";

export function ProjectCard({
  project,
  variant = "default",
  className,
}: {
  project: Project;
  variant?: "default" | "compact";
  className?: string;
}) {
  const isCompact = variant === "compact";

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[14px] border border-line bg-surface shadow-card transition-all duration-200",
        "hover:border-line-strong hover:shadow-[0_8px_24px_-16px_rgb(16_24_40/0.22)]",
        "has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-[#0f766e]",
        isCompact ? "p-3.5" : "p-4",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <ProjectIcon
          name={project.name}
          icon={project.icon}
          size={isCompact ? "sm" : "md"}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-1">
            <h3 className="min-w-0 flex-1 text-[13.5px] font-semibold leading-snug text-ink">
              <Link
                href={projectPath(project.kind, project.slug)}
                className="after:absolute after:inset-0 after:rounded-[14px] after:content-[''] focus:outline-none"
                title={project.name}
              >
                <span className="line-clamp-2">{project.name}</span>
              </Link>
            </h3>
            <FavoriteButton
              slug={project.slug}
              initial={project.isFavorite}
              size="sm"
              className="relative z-10 -mr-1 -mt-1"
            />
          </div>

          <p
            className={cn(
              "mt-1 text-[11.5px] leading-relaxed text-muted",
              isCompact ? "line-clamp-1" : "line-clamp-2",
            )}
          >
            {project.description || "Keine Beschreibung hinterlegt."}
          </p>
        </div>
      </div>

      {!isCompact && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <StatusBadge status={project.status} />
          {project.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-[5px] bg-surface-2 px-1.5 py-0.5 text-[9.5px] font-medium text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className={cn("mt-auto flex items-center justify-between gap-3", isCompact ? "pt-2.5" : "pt-4")}>
        <div className="flex min-w-0 items-center gap-2.5 text-[10.5px] font-medium text-subtle">
          <span className="inline-flex items-center gap-1" title={`${project.assetCount} EintrÃ¤ge`}>
            <IconLink className="h-3 w-3" />
            {project.assetCount}
          </span>
          <span className="inline-flex items-center gap-1" title={`${project.secretCount} Geheimnisse`}>
            <IconKey className="h-3 w-3" />
            {project.secretCount}
          </span>
        </div>

        {project.primaryUrl ? (
          <a
            href={project.primaryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 inline-flex h-7 shrink-0 items-center gap-1 rounded-[6px] border border-line bg-surface px-2 text-[10.5px] font-semibold text-ink transition hover:border-line-strong hover:bg-surface-2"
          >
            Ã–ffnen
            <IconArrowUpRight className="h-3 w-3" />
          </a>
        ) : (
          <span className="inline-flex h-7 items-center rounded-[6px] bg-surface-2 px-2 text-[10.5px] font-medium text-subtle">
            Kein Link
          </span>
        )}
      </div>
    </article>
  );
}
