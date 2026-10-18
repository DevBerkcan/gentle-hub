import { describe, expect, it } from "vitest";
import { LIMITS, normalizeUrl, validateApplicationInput, validateNotes } from "@/lib/validation";

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

  it("adds https:// to bare addresses", () => {
    const result = validateApplicationInput({ ...valid, url: "www.gentlebook.de/superadmin/login" });
    expect(result.ok && result.value.url).toBe("https://www.gentlebook.de/superadmin/login");
  });

  it("rejects unsafe or missing links", () => {
    for (const url of ["javascript:alert(1)", "JavaScript:alert(1)", "data:text/html,x", "ftp://x.de", "nicht gültig", ""]) {
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

describe("normalizeUrl", () => {
  it("only prefixes addresses without a scheme", () => {
    expect(normalizeUrl(" gentlebook.de ")).toBe("https://gentlebook.de");
    expect(normalizeUrl("//gentlebook.de")).toBe("https://gentlebook.de");
    expect(normalizeUrl("http://intern.local")).toBe("http://intern.local");
    expect(normalizeUrl("javascript:alert(1)")).toBe("javascript:alert(1)");
    expect(normalizeUrl("")).toBe("");
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
