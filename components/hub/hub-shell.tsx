"use client";

import { useCallback, useEffect, useMemo, useOptimistic, useRef, useState, useSyncExternalStore, useTransition } from "react";
import type { Application } from "@/types";
import { getCategories } from "@/data/applications";
import { filterApplications, matchesQuery, type CategoryFilterValue } from "@/lib/search";
import { recordOpened, useRecentIds } from "@/lib/storage";
import { useVault, type StoredVaultSnapshot } from "@/lib/use-vault";
import { displayNameFromEmail } from "@/lib/allowlist";
import { setFavoriteAction } from "@/app/actions";

import { AppHeader } from "@/components/hub/app-header";
import { ApplicationSearch } from "@/components/hub/application-search";
import { ApplicationGrid } from "@/components/hub/application-grid";
import { ApplicationDialog, type DialogState } from "@/components/hub/application-dialog";
import { CategoryFilter } from "@/components/hub/category-filter";
import { CommandPalette } from "@/components/hub/command-palette";
import { EmptyState } from "@/components/hub/empty-state";
import { UserMenu } from "@/components/hub/user-menu";
import { buttonClass } from "@/components/hub/application-form";
import { IconPlus } from "@/components/ui/icons";

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

type HubShellProps = {
  applications: Application[];
  favorites: string[];
  vault: StoredVaultSnapshot;
  user: { email: string };
};

export function HubShell({ applications, favorites: savedFavorites, vault: storedVault, user }: HubShellProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilterValue>("all");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const greeting = useGreeting();
  const recentIds = useRecentIds();
  const vault = useVault(storedVault);

  const [, startTransition] = useTransition();
  const [favorites, toggleOptimistic] = useOptimistic(savedFavorites, (current: string[], id: string) =>
    current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
  );
  const onToggleFavorite = useCallback(
    (id: string) => {
      const favorite = !favorites.includes(id);
      startTransition(async () => {
        toggleOptimistic(id);
        await setFavoriteAction(id, favorite);
      });
    },
    [favorites, toggleOptimistic]
  );

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

  // Once unlocked, drop vault entries of applications deleted in the meantime.
  const { prune, status: vaultStatus } = vault;
  useEffect(() => {
    if (vaultStatus === "unlocked") void prune(applications.map((app) => app.id));
  }, [vaultStatus, applications, prune]);

  const isSearching = query.trim().length > 0;
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  const openInfo = useCallback((id: string) => setDialog({ mode: "view", id }), []);
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

  const gridProps = { favorites, onToggleFavorite, onOpen: recordOpened, onInfo: openInfo };

  return (
    <div className="min-h-dvh">
      <AppHeader
        actions={
          <>
            <button
              type="button"
              onClick={() => setDialog({ mode: "create" })}
              className={buttonClass.primary}
              aria-label="Anwendung hinzufügen"
            >
              <IconPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Anwendung</span>
            </button>
            <UserMenu email={user.email} vault={vault} />
          </>
        }
      >
        <ApplicationSearch ref={searchRef} value={query} onChange={setQuery} />
      </AppHeader>

      <main className="mx-auto w-full max-w-[var(--container-max)] px-4 pb-16 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-[28px]">
            {greeting}, {displayNameFromEmail(user.email)}
          </h1>
          <p className="mt-1 text-sm text-fg-muted sm:text-[15px]">
            Alle Anwendungen der Gentle Group – ein Klick zum Öffnen.
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-line-strong px-6 py-16 text-center">
            <p className="text-base font-semibold text-fg">Noch keine Anwendungen</p>
            <p className="mt-1.5 max-w-sm text-sm text-fg-muted">Lege die erste Anwendung mit Link, Notizen und Zugangsdaten an.</p>
            <button type="button" onClick={() => setDialog({ mode: "create" })} className={`${buttonClass.primary} mt-5`}>
              <IconPlus className="h-4 w-4" /> Anwendung hinzufügen
            </button>
          </div>
        ) : (
          <>
            {!isSearching && favoriteApps.length > 0 && (
              <section aria-labelledby="favorites-heading" className="mb-10">
                <h2 id="favorites-heading" className="mb-3 text-sm font-medium text-fg-muted">
                  Favoriten
                </h2>
                <ApplicationGrid applications={favoriteApps} {...gridProps} variant="compact" />
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
                <ApplicationGrid applications={visible} {...gridProps} />
              ) : (
                <EmptyState onReset={resetFilters} />
              )}
            </section>
          </>
        )}
      </main>

      {paletteOpen && (
        <CommandPalette
          applications={applications}
          favorites={favorites}
          recentIds={recentIds}
          onClose={closePalette}
          onOpenApplication={recordOpened}
        />
      )}

      {dialog && (
        <ApplicationDialog
          state={dialog}
          application={dialog.mode === "view" ? applications.find((app) => app.id === dialog.id) : undefined}
          vault={vault}
          onClose={() => setDialog(null)}
          onCreated={(id) => setDialog({ mode: "view", id })}
          onOpen={recordOpened}
        />
      )}
    </div>
  );
}
