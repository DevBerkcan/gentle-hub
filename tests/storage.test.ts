import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  FAVORITES_KEY,
  MAX_RECENT,
  RECENT_KEY,
  parseFavorites,
  parseRecent,
  readRaw,
  recordOpened,
  subscribe,
  toggleFavorite,
} from "@/lib/storage";

beforeEach(() => {
  window.localStorage.clear();
});

describe("parseFavorites", () => {
  it("returns null when nothing is stored, so config defaults apply", () => {
    expect(parseFavorites(null)).toBeNull();
  });

  it("returns null for corrupt or wrongly-typed data", () => {
    expect(parseFavorites("{not json")).toBeNull();
    expect(parseFavorites(JSON.stringify({ a: 1 }))).toBeNull();
    expect(parseFavorites(JSON.stringify([1, 2]))).toBeNull();
  });

  it("returns a stored empty list (user removed all favorites)", () => {
    expect(parseFavorites("[]")).toEqual([]);
  });
});

describe("parseRecent", () => {
  it("drops malformed entries", () => {
    const raw = JSON.stringify([
      { applicationId: "a", timestamp: 1 },
      { applicationId: 42, timestamp: 2 },
      null,
      "b",
    ]);
    expect(parseRecent(raw)).toEqual([{ applicationId: "a", timestamp: 1 }]);
  });

  it("returns an empty list for corrupt data", () => {
    expect(parseRecent("oops")).toEqual([]);
  });
});

describe("toggleFavorite", () => {
  it("adds and removes ids and persists the result", () => {
    expect(toggleFavorite("a", [])).toEqual(["a"]);
    expect(parseFavorites(readRaw(FAVORITES_KEY))).toEqual(["a"]);
    expect(toggleFavorite("a", ["a", "b"])).toEqual(["b"]);
    expect(parseFavorites(readRaw(FAVORITES_KEY))).toEqual(["b"]);
  });

  it("notifies subscribers", () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);
    toggleFavorite("a", []);
    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });
});

describe("recordOpened", () => {
  it("keeps the most recent first, deduplicated and capped", () => {
    for (let i = 0; i < MAX_RECENT + 2; i++) recordOpened(`app-${i}`);
    recordOpened("app-3");

    const ids = parseRecent(readRaw(RECENT_KEY)).map((entry) => entry.applicationId);
    expect(ids[0]).toBe("app-3");
    expect(ids).toHaveLength(MAX_RECENT);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
