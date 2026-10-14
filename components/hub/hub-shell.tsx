"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { Application } from "@/types";
import { getCategories, getDefaultFavoriteIds } from "@/data/applications";
import { filterApplications, matchesQuery, type CategoryFilterValue } from "@/lib/search";
import { useHubPreferences } from "@/lib/use-hub-preferences";

import { AppHeader } from "@/components/hub/app-header";
import { ApplicationSearch } from "@/components/hub/application-search";
import { ApplicationGrid } from "@/components/hub/application-grid";
import { CategoryFilter } from "@/components/hub/category-filter";
import { CommandPalette } from "@/components/hub/command-palette";
import { EmptyState } from "@/components/hub/empty-state";

function isEditableTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

const noopSubscribe = () => () => {};

/** Time-of-day greeting. Rendered as a neutral fallback on the server to avoid hydration mismatches. */
function useGreeting(): string {
  return useSyncExternalStore(
    noopSubscribe,
    () => {
      const hour = new Date().getHours();
      if (hour < 11) return "Guten Morgen";
      if (hour < 18) return "Guten Tag";
      return "Guten Abend";
    },
    () => "Willkommen"
  );
}

export function HubShell({ applications }: { applications: Application[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilterValue>("all");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const greeting = useGreeting();

  const defaultFavorites = useMemo(() => getDefaultFavoriteIds(applications), [applications]);
  const { favorites, recentIds, onToggleFavorite, onOpen } = useHubPreferences(defaultFavorites);

  const categories = useMemo(() => getCategories(applications), [applications]);
  const visible = useMemo(
    () => filterApplications(applications, query, category),
    [applications, query, category]
  );
  // Counts reflect the current search so the chips tell you where matches are.
  const counts = useMemo(() => {
    const matching = applications.filter((app) => matchesQuery(app, query));
    const result = { all: matching.length } as Record<CategoryFilterValue, number>;
    for (const app of matching) result[app.category] = (result[app.category] ?? 0) + 1;
    return result;
  }, [applications, query]);
  const favoriteApps = useMemo(
    () => favorites.map((id) => applications.find((app) => app.id === id)).filter((app): app is Application => !!app),
    [favorites, applications]
  );

  const isSearching = query.trim().length > 0;
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  const resetFilters = useCallback(() => {
    setQuery("");
    setCategory("all");
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      } else if (event.key === "/" && !isEditableTarget(event.target)) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-dvh">
      <AppHeader>
        <ApplicationSearch ref={searchRef} value={query} onChange={setQuery} />
      </AppHeader>

      <main className="mx-auto w-full max-w-[var(--container-max)] px-4 pb-16 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-[28px]">{greeting}</h1>
          <p className="mt-1 text-sm text-fg-muted sm:text-[15px]">
            Alle Anwendungen der Gentle Group – ein Klick zum Öffnen.
          </p>
        </div>

        {!isSearching && favoriteApps.length > 0 && (
          <section aria-labelledby="favorites-heading" className="mb-10">
            <h2 id="favorites-heading" className="mb-3 text-sm font-medium text-fg-muted">
              Favoriten
            </h2>
            <ApplicationGrid
              applications={favoriteApps}
              favorites={favorites}
              onToggleFavorite={onToggleFavorite}
              onOpen={onOpen}
              variant="compact"
            />
          </section>
        )}

        <section aria-labelledby="all-applications-heading">
          <div className="mb-4 flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="all-applications-heading" className="text-sm font-medium text-fg-muted">
                {isSearching ? `Ergebnisse für „${query.trim()}“` : "Alle Anwendungen"}
              </h2>
              <p className="text-xs tabular-nums text-fg-subtle" aria-live="polite">
                {visible.length} {visible.length === 1 ? "Anwendung" : "Anwendungen"}
              </p>
            </div>
            {categories.length > 1 && (
              <CategoryFilter categories={categories} counts={counts} active={category} onChange={setCategory} />
            )}
          </div>

          {visible.length > 0 ? (
            <ApplicationGrid
              applications={visible}
              favorites={favorites}
              onToggleFavorite={onToggleFavorite}
              onOpen={onOpen}
            />
          ) : (
            <EmptyState onReset={resetFilters} />
          )}
        </section>
      </main>

      {paletteOpen && (
        <CommandPalette
          applications={applications}
          favorites={favorites}
          recentIds={recentIds}
          onClose={closePalette}
          onOpenApplication={onOpen}
        />
      )}
    </div>
  );
}
