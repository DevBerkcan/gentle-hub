import type { Application } from "@/types";
import { cn } from "@/lib/utils";
import { ApplicationCard } from "@/components/hub/application-card";

type ApplicationGridProps = {
  applications: Application[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onOpen: (id: string) => void;
  variant?: "default" | "compact";
};

export function ApplicationGrid({
  applications,
  favorites,
  onToggleFavorite,
  onOpen,
  variant = "default",
}: ApplicationGridProps) {
  return (
    <ul
      className={cn(
        "grid gap-3",
        variant === "compact"
          ? "grid-cols-[repeat(auto-fill,minmax(min(100%,13.5rem),1fr))]"
          : "grid-cols-[repeat(auto-fill,minmax(min(100%,16.5rem),1fr))] sm:gap-4"
      )}
    >
      {applications.map((application) => (
        <li key={application.id} className="flex [&>*]:flex-1">
          <ApplicationCard
            application={application}
            isFavorite={favorites.includes(application.id)}
            onToggleFavorite={onToggleFavorite}
            onOpen={onOpen}
            variant={variant}
          />
        </li>
      ))}
    </ul>
  );
}
