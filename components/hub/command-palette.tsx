"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { Application } from "@/types";
import { CATEGORY_LABELS } from "@/data/applications";
import { filterApplications } from "@/lib/search";
import { cn, isValidExternalUrl } from "@/lib/utils";
import { AppIcon } from "@/components/ui/app-icon";
import { IconArrow } from "@/components/ui/icon-arrow";
import { Kbd } from "@/components/ui/kbd";

type CommandPaletteProps = {
  applications: Application[];
  favorites: string[];
  recentIds: string[];
  onClose: () => void;
  onOpenApplication: (id: string) => void;
};

type Group = { label: string; items: Application[] };

/** Without a query: favorites, then recently opened, then everything else. With a query: matches only. */
export function buildPaletteGroups(
  applications: Application[],
  query: string,
  favorites: string[],
  recentIds: string[]
): Group[] {
  const openable = applications.filter((app) => !app.disabled && isValidExternalUrl(app.url));
  if (query.trim()) return [{ label: "Ergebnisse", items: filterApplications(openable, query) }];

  const byId = new Map(openable.map((app) => [app.id, app]));
  const pick = (ids: string[]) => ids.map((id) => byId.get(id)).filter((app): app is Application => !!app);

  const favoriteApps = pick(favorites);
  const recentApps = pick(recentIds).filter((app) => !favorites.includes(app.id));
  const shown = new Set([...favoriteApps, ...recentApps].map((app) => app.id));
  const rest = openable.filter((app) => !shown.has(app.id));

  return [
    { label: "Favoriten", items: favoriteApps },
    { label: "Zuletzt geöffnet", items: recentApps },
    { label: "Alle Anwendungen", items: rest },
  ].filter((group) => group.items.length > 0);
}

/** Mount only while open — state resets naturally on every open. */
export function CommandPalette({
  applications,
  favorites,
  recentIds,
  onClose,
  onOpenApplication,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const groups = useMemo(
    () => buildPaletteGroups(applications, query, favorites, recentIds),
    [applications, query, favorites, recentIds]
  );
  const results = useMemo(() => groups.flatMap((group) => group.items), [groups]);
  const groupOffsets = useMemo(
    () => groups.map((_, i) => groups.slice(0, i).reduce((sum, group) => sum + group.items.length, 0)),
    [groups]
  );
  const optionId = (index: number) => `${listId}-option-${index}`;

  // Focus the input, lock page scroll, and hand focus back to the trigger on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  useEffect(() => {
    document.getElementById(optionId(activeIndex))?.scrollIntoView?.({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- optionId is derived from the stable listId
  }, [activeIndex]);

  function openResult(application: Application) {
    onOpenApplication(application.id);
    window.open(application.url, "_blank", "noopener,noreferrer");
    onClose();
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    switch (event.key) {
      case "Escape":
        event.preventDefault();
        onClose();
        break;
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((current) => Math.min(current + 1, results.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((current) => Math.max(current - 1, 0));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(Math.max(results.length - 1, 0));
        break;
      case "Enter": {
        event.preventDefault();
        const target = results[activeIndex];
        if (target) openResult(target);
        break;
      }
      case "Tab":
        // The input is the only tabbable element — keep focus inside the dialog.
        event.preventDefault();
        break;
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-overlay px-4 pt-[12vh] backdrop-blur-[2px] animate-[fade-in_160ms_ease-out]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Schnellsuche"
        onKeyDown={handleKeyDown}
        className="w-full max-w-xl overflow-hidden rounded-card border border-line bg-surface shadow-popover animate-[palette-in_200ms_var(--ease-hub)]"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0 text-fg-subtle">
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" fill="none" />
            <path d="M20 20l-4.3-4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results.length > 0 ? optionId(activeIndex) : undefined}
            aria-autocomplete="list"
            placeholder="Anwendung öffnen…"
            aria-label="Anwendung suchen und öffnen"
            autoComplete="off"
            spellCheck={false}
            className="h-12 w-full bg-transparent text-[15px] text-fg placeholder:text-fg-subtle focus:outline-none"
          />
          <Kbd>Esc</Kbd>
        </div>

        <div
          id={listId}
          role="listbox"
          aria-label="Anwendungen"
          className="max-h-[min(24rem,60vh)] overflow-y-auto p-2"
        >
          {results.length === 0 && (
            <p className="px-3 py-10 text-center text-sm text-fg-muted">Keine Anwendung gefunden.</p>
          )}
          {groups.map((group, groupIndex) => (
            <div key={group.label} role="group" aria-labelledby={`${listId}-group-${groupIndex}`}>
              <div
                id={`${listId}-group-${groupIndex}`}
                className="px-2.5 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-fg-subtle"
              >
                {group.label}
              </div>
              {group.items.map((application, itemIndex) => {
                const index = groupOffsets[groupIndex] + itemIndex;
                const isActive = index === activeIndex;
                return (
                  <div
                    key={application.id}
                    id={optionId(index)}
                    role="option"
                    aria-selected={isActive}
                    onMouseMove={() => !isActive && setActiveIndex(index)}
                    onClick={() => openResult(application)}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-control px-2.5 py-2 text-sm",
                      isActive ? "bg-surface-muted text-fg" : "text-fg-muted"
                    )}
                  >
                    <AppIcon application={application} size="sm" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-medium text-fg">{application.name}</span>
                      <span className="truncate text-xs text-fg-subtle">
                        {CATEGORY_LABELS[application.category]} · {application.description}
                      </span>
                    </span>
                    <IconArrow className={cn("h-3.5 w-3.5 shrink-0", isActive ? "opacity-100" : "opacity-0")} />
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="hidden items-center gap-4 border-t border-line px-4 py-2.5 text-xs text-fg-subtle sm:flex">
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> navigieren
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>↵</Kbd> in neuem Tab öffnen
          </span>
        </div>
      </div>
    </div>
  );
}
