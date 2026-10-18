import { beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_RECENT, RECENT_KEY, parseRecent, readRaw, recordOpened, subscribe } from "@/lib/storage";

beforeEach(() => {
  window.localStorage.clear();
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

  it("returns an empty list for missing or corrupt data", () => {
    expect(parseRecent(null)).toEqual([]);
    expect(parseRecent("oops")).toEqual([]);
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

  it("notifies subscribers", () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);
    recordOpened("a");
    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });
});
