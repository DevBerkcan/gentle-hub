import type { RecentEntry } from "@/types";

export const RECENT_KEY = "gentle-hub:recent";
export const FAVORITES_KEY = "gentle-hub:favorites";
export const MAX_RECENT = 5;

const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) listener();
}

/**
 * Subscribes to preference changes from this tab (via write helpers) and from
 * other tabs (via the native `storage` event). Shaped for `useSyncExternalStore`.
 */
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

function writeJSON<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be unavailable (private mode, quota). Fail silently —
    // recents/favorites are a convenience, not critical state.
  }
  notify();
}

function safeParse(raw: string | null): unknown {
  if (raw === null) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

/** Parses stored favorites. Returns null when the user has never set favorites (or data is corrupt). */
export function parseFavorites(raw: string | null): string[] | null {
  const value = safeParse(raw);
  if (!Array.isArray(value) || !value.every((id) => typeof id === "string")) return null;
  return value;
}

/** Parses stored recents, dropping malformed entries. */
export function parseRecent(raw: string | null): RecentEntry[] {
  const value = safeParse(raw);
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
  const existing = parseRecent(readRaw(RECENT_KEY)).filter(
    (entry) => entry.applicationId !== applicationId
  );
  writeJSON(RECENT_KEY, [{ applicationId, timestamp: Date.now() }, ...existing].slice(0, MAX_RECENT));
}

/** Toggles an application in the given favorites list and persists the result. */
export function toggleFavorite(applicationId: string, current: string[]): string[] {
  const updated = current.includes(applicationId)
    ? current.filter((id) => id !== applicationId)
    : [...current, applicationId];
  writeJSON(FAVORITES_KEY, updated);
  return updated;
}
