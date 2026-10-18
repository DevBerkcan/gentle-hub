import { describe, expect, it } from "vitest";
import { LIMITS, validateApplicationInput, validateNotes } from "@/lib/validation";

const valid = {
  name: " GentleBook ",
  description: "SaaS für Online-Terminbuchungen.",
  url: "https://www.gentlebook.de/superadmin/login",
  category: "saas",
  environment: "",
  icon: "",
};

describe("validateApplicationInput", () => {
  it("accepts and normalizes valid input", () => {
    const result = validateApplicationInput(valid);
    expect(result).toEqual({
      ok: true,
      value: {
        name: "GentleBook",
        description: "SaaS für Online-Terminbuchungen.",
        url: "https://www.gentlebook.de/superadmin/login",
        category: "saas",
        environment: undefined,
        icon: undefined,
      },
    });
  });

  it("rejects unsafe or missing links", () => {
    for (const url of ["javascript:alert(1)", "data:text/html,x", "www.ohne-protokoll.de", ""]) {
      const result = validateApplicationInput({ ...valid, url });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors.url).toBeDefined();
    }
  });

  it("requires a name and a known category", () => {
    const result = validateApplicationInput({ ...valid, name: "  ", category: "erp" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.name).toBeDefined();
      expect(result.errors.category).toBeDefined();
    }
  });

  it("enforces length limits and valid icon/environment values", () => {
    const result = validateApplicationInput({
      ...valid,
      name: "x".repeat(LIMITS.name + 1),
      icon: "javascript:alert(1)",
      environment: "prod",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.errors).sort()).toEqual(["environment", "icon", "name"]);
  });

  it("treats non-object input as empty", () => {
    expect(validateApplicationInput(null).ok).toBe(false);
  });
});

describe("validateNotes", () => {
  it("accepts strings within the limit", () => {
    expect(validateNotes("Idee: Termine per WhatsApp")).toBe("Idee: Termine per WhatsApp");
    expect(validateNotes("")).toBe("");
  });

  it("rejects non-strings and oversized notes", () => {
    expect(validateNotes(42)).toBeNull();
    expect(validateNotes("x".repeat(LIMITS.notes + 1))).toBeNull();
  });
});
