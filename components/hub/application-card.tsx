"use client";

import type { Application } from "@/types";
import { CATEGORY_LABELS } from "@/data/applications";
import { cn, isValidExternalUrl } from "@/lib/utils";
import { AppIcon } from "@/components/ui/app-icon";
import { IconArrow } from "@/components/ui/icon-arrow";
import { IconInfo, IconNote } from "@/components/ui/icons";
import { EnvironmentBadge } from "@/components/ui/environment-badge";
import { FavoriteButton } from "@/components/ui/favorite-button";

type ApplicationCardProps = {
  application: Application;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpen: (id: string) => void;
  onInfo: (id: string) => void;
  variant?: "default" | "compact";
};

/**
 * The "Öffnen" link is stretched over the whole card (its `::after` covers it),
 * so one click anywhere opens the application. Info and favorite buttons sit
 * above it as siblings — no interactive element is nested inside the link.
 */
export function ApplicationCard({
  application,
  isFavorite,
  onToggleFavorite,
  onOpen,
  onInfo,
  variant = "default",
}: ApplicationCardProps) {
  const { id, name, description, url, category, environment, disabled, notes } = application;
  const isInteractive = !disabled && isValidExternalUrl(url);
  const compact = variant === "compact";
  const stretch = "after:absolute after:inset-0 after:rounded-[inherit] after:content-['']";

  const openLinkProps = {
    href: url,
    target: "_blank",
    rel: "noopener noreferrer",
    onClick: () => onOpen(id),
    "aria-label": `${name} öffnen (neuer Tab)`,
  } as const;

  const infoButton = (
    <button
      type="button"
      onClick={() => onInfo(id)}
      aria-label={`Infos zu ${name}`}
      title="Infos, Notizen & Zugangsdaten"
      className={cn(
        "focus-ring relative z-10 flex items-center gap-1.5 rounded-lg text-fg-muted transition-colors duration-[var(--duration-fast)] hover:bg-surface-muted hover:text-fg",
        compact ? "h-9 w-9 justify-center" : "h-8 px-2.5 text-[13px] font-medium"
      )}
    >
      <IconInfo className="h-4 w-4" />
      {!compact && <span>Info</span>}
    </button>
  );

  return (
    <article
      aria-disabled={isInteractive ? undefined : true}
      className={cn(
        "group relative flex rounded-card border border-line bg-surface shadow-card",
        "transition-[transform,box-shadow,border-color] duration-[var(--duration-medium)] ease-[var(--ease-hub)]",
        isInteractive &&
          "hover:-translate-y-0.5 hover:border-line-strong hover:bg-surface-hover hover:shadow-card-hover has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-ring",
        compact ? "items-center gap-3 p-3 pr-1.5" : "min-h-48 flex-col p-4 sm:p-5"
      )}
    >
      {compact ? (
        <>
          <AppIcon application={application} size="sm" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold tracking-tight text-fg">
              {isInteractive ? (
                <a {...openLinkProps} className={cn("outline-none", stretch)}>
                  {name}
                </a>
              ) : (
                name
              )}
            </h3>
            <p className="truncate text-xs text-fg-subtle">{CATEGORY_LABELS[category]}</p>
          </div>
          {infoButton}
        </>
      ) : (
        <>
          <AppIcon application={application} />
          <h3 className="mt-4 pr-8 text-[15px] font-semibold tracking-tight text-fg">{name}</h3>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-fg-muted">{description}</p>
          <div className="mt-3 flex flex-1 items-start gap-2 text-xs text-fg-subtle">
            <span>{CATEGORY_LABELS[category]}</span>
            <EnvironmentBadge environment={environment} />
            {notes?.trim() && (
              <span className="flex items-center gap-1" title="Hat Notizen">
                <IconNote className="h-3.5 w-3.5" />
                <span className="sr-only">Hat Notizen</span>
              </span>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between gap-2">
            {isInteractive ? (
              <a
                {...openLinkProps}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-lg bg-fg px-3 text-[13px] font-medium text-bg outline-none transition-opacity duration-[var(--duration-fast)] group-hover:opacity-90",
                  stretch
                )}
              >
                Öffnen
                <IconArrow className="h-3.5 w-3.5 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-hub)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            ) : (
              <span className="inline-flex h-8 items-center rounded-lg bg-surface-muted px-3 text-[13px] text-fg-subtle">
                {disabled ? "Nicht verfügbar" : "Link fehlt"}
              </span>
            )}
            {infoButton}
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
