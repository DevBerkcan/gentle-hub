import Link from "next/link";
import { cn } from "@/lib/cn";
import { accentOf } from "@/lib/constants";
import type { Project } from "@/lib/types";
import { ProjectIcon } from "@/components/ui/project-icon";
import { EnvironmentBadge, StatusBadge } from "@/components/ui/badge";
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
  const tone = accentOf(project.accent);
  const isCompact = variant === "compact";

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[20px] border border-line bg-surface shadow-card transition-all duration-300 ease-[var(--ease)]",
        "hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[0_18px_40px_-22px_rgb(11_16_42/0.28),0_3px_10px_rgb(11_16_42/0.04)]",
        "has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-[#00b77a]",
        isCompact ? "p-4" : "p-5",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("absolute inset-x-0 top-0 h-[3px] opacity-80", tone.dot)}
      />

      <div className="flex items-start gap-3">
        <ProjectIcon
          name={project.name}
          icon={project.icon}
          accent={project.accent}
          size={isCompact ? "sm" : "md"}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-1.5">
            <h3 className="min-w-0 flex-1 text-[15px] font-bold leading-snug tracking-[-0.01em] text-ink">
              <Link
                href={`/p/${project.slug}`}
                className="after:absolute after:inset-0 after:rounded-[20px] after:content-[''] focus:outline-none"
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
              "mt-1 text-[12.5px] leading-relaxed text-muted",
              isCompact ? "line-clamp-1" : "line-clamp-2",
            )}
          >
            {project.description || "Keine Beschreibung hinterlegt."}
          </p>
        </div>
      </div>

      {!isCompact && (
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
          <StatusBadge status={project.status} />
          {project.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-[#f4f2f9] px-2 py-0.5 text-[10px] font-medium text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className={cn("mt-auto flex items-center justify-between gap-3", isCompact ? "pt-3" : "pt-5")}>
        <div className="flex min-w-0 items-center gap-3 text-[11px] font-medium text-subtle">
          <span className="inline-flex items-center gap-1" title={`${project.assetCount} Einträge`}>
            <IconLink className="h-3.5 w-3.5" />
            {project.assetCount}
          </span>
          <span className="inline-flex items-center gap-1" title={`${project.secretCount} gespeicherte Geheimnisse`}>
            <IconKey className="h-3.5 w-3.5" />
            {project.secretCount}
          </span>
          <EnvironmentBadge environment={null} />
        </div>

        {project.primaryUrl ? (
          <a
            href={project.primaryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 inline-flex h-8 shrink-0 items-center gap-1 rounded-[9px] bg-[#f4f2f9] px-2.5 text-[11.5px] font-semibold text-ink transition hover:bg-navy hover:text-white"
          >
            Öffnen
            <IconArrowUpRight className="h-3.5 w-3.5" />
          </a>
        ) : (
          <span className="inline-flex h-8 items-center rounded-[9px] bg-[#f4f2f9] px-2.5 text-[11.5px] font-medium text-subtle">
            Kein Link
          </span>
        )}
      </div>
    </article>
  );
}
