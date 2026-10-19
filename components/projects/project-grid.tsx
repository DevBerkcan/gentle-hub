import { cn } from "@/lib/cn";
import type { Project } from "@/lib/types";
import { ProjectCard } from "@/components/projects/project-card";

export function ProjectGrid({
  projects,
  className,
  compact = false,
}: {
  projects: Project[];
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid gap-3",
        compact ? "sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3",
        className,
      )}
    >
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} variant={compact ? "compact" : "default"} />
      ))}
    </div>
  );
}
