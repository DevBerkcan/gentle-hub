import { describe, expect, it, vi } from "vitest";
import { createMagicLinkSender, displayNameFromEmail, isAllowedEmail, parseAllowedEmails } from "@/lib/allowlist";

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

describe("createMagicLinkSender", () => {
  const allowed = () => parseAllowedEmails("berkcan@gentlegroup.de");

  it("sends only to allowlisted addresses", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const sender = createMagicLinkSender(send, allowed);

    await sender({ email: "Berkcan@gentlegroup.de", url: "https://hub/verify?token=a" });
    await sender({ email: "intruder@example.com", url: "https://hub/verify?token=b" });

    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith({ to: "berkcan@gentlegroup.de", url: "https://hub/verify?token=a" });
  });

  it("resolves identically for unknown addresses (no allowlist probing)", async () => {
    const sender = createMagicLinkSender(vi.fn().mockResolvedValue(undefined), allowed);
    await expect(sender({ email: "intruder@example.com", url: "x" })).resolves.toBeUndefined();
    await expect(sender({ email: "berkcan@gentlegroup.de", url: "x" })).resolves.toBeUndefined();
  });
});

describe("displayNameFromEmail", () => {
  it("capitalizes the local part", () => {
    expect(displayNameFromEmail("medin@gentlegroup.de")).toBe("Medin");
    expect(displayNameFromEmail(null)).toBe("Unbekannt");
  });
});
