import { describe, expect, it } from "vitest";
import type { Application } from "@/types";
import {
  CATEGORY_LABELS,
  applications,
  getCategories,
  getDefaultFavoriteIds,
  validateApplications,
} from "@/data/applications";

describe("application registry", () => {
  it("has unique ids, safe URLs and valid icons", () => {
    expect(validateApplications()).toEqual([]);
  });

  it("only uses known categories", () => {
    for (const app of applications) expect(CATEGORY_LABELS[app.category]).toBeDefined();
  });
});

describe("validateApplications", () => {
  it("reports duplicate ids and unsafe URLs", () => {
    const list: Application[] = [
      { id: "a", name: "A", description: "", url: "https://a.example.com", category: "saas" },
      { id: "a", name: "A2", description: "", url: "javascript:alert(1)", category: "saas" },
    ];
    const problems = validateApplications(list);
    expect(problems).toHaveLength(2);
    expect(problems.join(" ")).toMatch(/Doppelte id/);
    expect(problems.join(" ")).toMatch(/Ungültige URL/);
  });
});

describe("getCategories", () => {
  it("returns only used categories in the fixed display order", () => {
    const list: Application[] = [
      { id: "x", name: "X", description: "", url: "https://x.example.com", category: "customer" },
      { id: "y", name: "Y", description: "", url: "https://y.example.com", category: "saas" },
    ];
    expect(getCategories(list)).toEqual(["saas", "customer"]);
  });
});

describe("getDefaultFavoriteIds", () => {
  it("returns ids marked as isFavorite", () => {
    const list: Application[] = [
      { id: "x", name: "X", description: "", url: "https://x.example.com", category: "saas", isFavorite: true },
      { id: "y", name: "Y", description: "", url: "https://y.example.com", category: "saas" },
    ];
    expect(getDefaultFavoriteIds(list)).toEqual(["x"]);
  });
});
