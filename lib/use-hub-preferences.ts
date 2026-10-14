"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  FAVORITES_KEY,
  RECENT_KEY,
  parseFavorites,
  parseRecent,
  readRaw,
  recordOpened,
  subscribe,
  toggleFavorite,
} from "@/lib/storage";

const getServerSnapshot = () => null;

/**
 * Favorites and recently opened applications, persisted in localStorage.
 * Server render and first client render use the defaults, so there is no
 * hydration mismatch; stored values take over right after hydration.
 */
export function useHubPreferences(defaultFavorites: string[]) {
  const favoritesRaw = useSyncExternalStore(subscribe, () => readRaw(FAVORITES_KEY), getServerSnapshot);
  const recentRaw = useSyncExternalStore(subscribe, () => readRaw(RECENT_KEY), getServerSnapshot);

  const favorites = useMemo(
    () => parseFavorites(favoritesRaw) ?? defaultFavorites,
    [favoritesRaw, defaultFavorites]
  );
  const recentIds = useMemo(
    () => parseRecent(recentRaw).map((entry) => entry.applicationId),
    [recentRaw]
  );

  const onToggleFavorite = useCallback((id: string) => toggleFavorite(id, favorites), [favorites]);

  return { favorites, recentIds, onToggleFavorite, onOpen: recordOpened };
}
