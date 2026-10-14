import { describe, expect, it } from "vitest";
import type { Application } from "@/types";
import { filterApplications, matchesCategory, matchesQuery } from "@/lib/search";

const apps: Application[] = [
  {
    id: "gentletrack",
    name: "GentleTrack",
    description: "Projektfortschritt und Meilensteine.",
    url: "https://gentletrack.example.com",
    category: "saas",
    tags: ["projekte", "team"],
  },
  {
    id: "admin-console",
    name: "Admin Console",
    description: "Nutzer und Rollen verwalten.",
    url: "https://admin.example.com",
    category: "internal",
    tags: ["nutzer", "rollen"],
  },
  {
    id: "support-desk",
    name: "Support Desk",
    description: "Ticketsystem für Kundenanfragen.",
    url: "https://support.example.com",
    category: "customer",
    tags: ["support", "tickets"],
  },
];

describe("matchesQuery", () => {
  it("matches by name, case-insensitively", () => {
    expect(matchesQuery(apps[0], "gentletrack")).toBe(true);
    expect(matchesQuery(apps[0], "GENTLETRACK")).toBe(true);
  });

  it("matches by description, ignoring diacritics", () => {
    expect(matchesQuery(apps[1], "rollen verwalten")).toBe(true);
    expect(matchesQuery(apps[2], "fur kunden")).toBe(true);
  });

  it("matches by the human-readable category label", () => {
    expect(matchesQuery(apps[2], "kundenprojekte")).toBe(true);
    expect(matchesQuery(apps[1], "interne tools")).toBe(true);
  });

  it("matches by tags", () => {
    expect(matchesQuery(apps[2], "tickets")).toBe(true);
  });

  it("returns false when nothing matches", () => {
    expect(matchesQuery(apps[0], "rechnung")).toBe(false);
  });

  it("treats an empty query as matching everything", () => {
    expect(matchesQuery(apps[0], "")).toBe(true);
    expect(matchesQuery(apps[0], "   ")).toBe(true);
  });
});

describe("matchesCategory", () => {
  it("matches everything for 'all'", () => {
    expect(matchesCategory(apps[0], "all")).toBe(true);
    expect(matchesCategory(apps[1], "all")).toBe(true);
  });

  it("matches only the exact category otherwise", () => {
    expect(matchesCategory(apps[0], "saas")).toBe(true);
    expect(matchesCategory(apps[0], "customer")).toBe(false);
  });
});

describe("filterApplications", () => {
  it("combines query and category filters", () => {
    const result = filterApplications(apps, "verwalten", "internal");
    expect(result.map((a) => a.id)).toEqual(["admin-console"]);
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterApplications(apps, "does-not-exist")).toEqual([]);
  });

  it("returns the full list for an empty query and 'all' category", () => {
    expect(filterApplications(apps, "", "all")).toHaveLength(apps.length);
  });
});
