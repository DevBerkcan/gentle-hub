import { describe, expect, it } from "vitest";
import { displayNameFromEmail, isAllowedEmail, parseAllowedEmails } from "@/lib/allowlist";
import { checkPassword } from "@/lib/password-policy";

describe("parseAllowedEmails", () => {
  it("normalizes case and separators", () => {
    const allowed = parseAllowedEmails(" Berkcan@GentleGroup.de, medin@gentlegroup.de ;\n");
    expect([...allowed]).toEqual(["berkcan@gentlegroup.de", "medin@gentlegroup.de"]);
  });

  it("returns an empty set when unset — nobody is allowed", () => {
    expect(parseAllowedEmails(undefined).size).toBe(0);
    expect(isAllowedEmail("berkcan@gentlegroup.de", parseAllowedEmails(""))).toBe(false);
  });
});

describe("isAllowedEmail", () => {
  const allowed = parseAllowedEmails("berkcan@gentlegroup.de,medin@gentlegroup.de");

  it("matches case-insensitively", () => {
    expect(isAllowedEmail("BERKCAN@gentlegroup.de", allowed)).toBe(true);
    expect(isAllowedEmail(" medin@gentlegroup.de ", allowed)).toBe(true);
  });

  it("rejects everyone else, including look-alikes", () => {
    expect(isAllowedEmail("someone@gentlegroup.de", allowed)).toBe(false);
    expect(isAllowedEmail("berkcan@gentlegroup.de.evil.com", allowed)).toBe(false);
    expect(isAllowedEmail(null, allowed)).toBe(false);
  });
});

describe("checkPassword", () => {
  it("requires 12 to 128 characters", () => {
    expect(checkPassword("kurz")).toMatch(/12/);
    expect(checkPassword("x".repeat(129))).toMatch(/128/);
    expect(checkPassword("lang-genug-1234")).toBeNull();
  });
});

describe("displayNameFromEmail", () => {
  it("capitalizes the local part", () => {
    expect(displayNameFromEmail("medin@gentlegroup.de")).toBe("Medin");
    expect(displayNameFromEmail(null)).toBe("Unbekannt");
  });
});
