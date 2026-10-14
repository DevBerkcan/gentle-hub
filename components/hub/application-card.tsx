"use client";

import type { Application } from "@/types";
import { CATEGORY_LABELS } from "@/data/applications";
import { cn, isValidExternalUrl } from "@/lib/utils";
import { AppIcon } from "@/components/ui/app-icon";
import { IconArrow } from "@/components/ui/icon-arrow";
import { EnvironmentBadge } from "@/components/ui/environment-badge";
import { FavoriteButton } from "@/components/ui/favorite-button";

type ApplicationCardProps = {
  application: Application;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpen: (id: string) => void;
  variant?: "default" | "compact";
};

/**
 * The whole card is clickable through a stretched link (the `::after` of the
 * name link covers the card). The favorite button sits above it as a sibling,
 * so there is no interactive element nested inside the link.
 */
export function ApplicationCard({
  application,
  isFavorite,
  onToggleFavorite,
  onOpen,
  variant = "default",
}: ApplicationCardProps) {
  const { id, name, description, url, category, environment, disabled } = application;
  const isInteractive = !disabled && isValidExternalUrl(url);
  const compact = variant === "compact";

  const title = isInteractive ? (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onOpen(id)}
      aria-label={`${name} öffnen (neuer Tab)`}
      className="outline-none after:absolute after:inset-0 after:rounded-[inherit] after:content-['']"
    >
      {name}
    </a>
  ) : (
    name
  );

  return (
    <article
      aria-disabled={isInteractive ? undefined : true}
      className={cn(
        "group relative flex rounded-card border border-line bg-surface shadow-card",
        "transition-[transform,box-shadow,border-color] duration-[var(--duration-medium)] ease-[var(--ease-hub)]",
        isInteractive
          ? "hover:-translate-y-0.5 hover:border-line-strong hover:bg-surface-hover hover:shadow-card-hover has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-ring"
          : "opacity-60",
        compact ? "items-center gap-3 p-3 pr-2" : "min-h-44 flex-col p-4 sm:p-5"
      )}
    >
      {compact ? (
        <>
          <AppIcon application={application} size="sm" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold tracking-tight text-fg">{title}</h3>
            <p className="truncate text-xs text-fg-subtle">{CATEGORY_LABELS[category]}</p>
          </div>
        </>
      ) : (
        <>
          <AppIcon application={application} />
          <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-fg">{title}</h3>
          <p className="mt-1 line-clamp-2 flex-1 text-sm leading-relaxed text-fg-muted">{description}</p>
          <div className="mt-4 flex items-center gap-2 text-xs text-fg-subtle">
            <span>{CATEGORY_LABELS[category]}</span>
            <EnvironmentBadge environment={environment} />
            {isInteractive ? (
              <IconArrow className="ml-auto h-4 w-4 transition-[transform,color] duration-[var(--duration-fast)] ease-[var(--ease-hub)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-fg" />
            ) : (
              <span className="ml-auto">Nicht verfügbar</span>
            )}
          </div>
        </>
      )}

      {isInteractive && (
        <FavoriteButton
          active={isFavorite}
          appName={name}
          onToggle={() => onToggleFavorite(id)}
          className={cn("z-10", compact ? "relative" : "absolute right-3 top-3 sm:right-4 sm:top-4")}
        />
      )}
    </article>
  );
}
