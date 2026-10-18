import { useMemo, useSyncExternalStore } from "react";
import type { RecentEntry } from "@/types";

/*
 * "Zuletzt geöffnet" stays local per device — it is a convenience, not shared
 * data. Favorites and everything else live in the database.
 */

export const RECENT_KEY = "gentle-hub:recent";
export const MAX_RECENT = 5;

const listeners = new Set<() => void>();

/** Shaped for `useSyncExternalStore`: same-tab writes and other tabs (`storage` event). */
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** Raw stored string, or null when missing or storage is unavailable. Strings are stable snapshots. */
export function readRaw(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Parses stored recents, dropping malformed entries. */
export function parseRecent(raw: string | null): RecentEntry[] {
  let value: unknown;
  try {
    value = raw === null ? undefined : JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(value)) return [];
  return value.filter(
    (entry): entry is RecentEntry =>
      typeof entry === "object" &&
      entry !== null &&
      typeof entry.applicationId === "string" &&
      typeof entry.timestamp === "number"
  );
}

/** Records that an application was opened just now. */
export function recordOpened(applicationId: string): void {
  const existing = parseRecent(readRaw(RECENT_KEY)).filter((entry) => entry.applicationId !== applicationId);
  try {
    window.localStorage.setItem(
      RECENT_KEY,
      JSON.stringify([{ applicationId, timestamp: Date.now() }, ...existing].slice(0, MAX_RECENT))
    );
  } catch {
    // Storage may be unavailable (private mode, quota) — recents are optional.
  }
  for (const listener of listeners) listener();
}

const getServerSnapshot = () => null;

/** Ids of recently opened applications, most recent first. Empty during SSR. */
export function useRecentIds(): string[] {
  const raw = useSyncExternalStore(subscribe, () => readRaw(RECENT_KEY), getServerSnapshot);
  return useMemo(() => parseRecent(raw).map((entry) => entry.applicationId), [raw]);
}
