import { describe, expect, it } from "vitest";
import { isValidExternalUrl, toMonogram } from "@/lib/utils";

describe("isValidExternalUrl", () => {
  it("accepts absolute http and https URLs", () => {
    expect(isValidExternalUrl("https://gentletrack.gentlegroup.studio")).toBe(true);
    expect(isValidExternalUrl("http://internal.example.com")).toBe(true);
  });

  it("rejects non-http(s) protocols", () => {
    expect(isValidExternalUrl("javascript:alert(1)")).toBe(false);
    expect(isValidExternalUrl("JaVaScRiPt:alert(1)")).toBe(false);
    expect(isValidExternalUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
    expect(isValidExternalUrl("vbscript:msgbox(1)")).toBe(false);
    expect(isValidExternalUrl("ftp://files.example.com")).toBe(false);
  });

  it("rejects malformed, relative or protocol-relative URLs", () => {
    expect(isValidExternalUrl("not a url")).toBe(false);
    expect(isValidExternalUrl("/relative/path")).toBe(false);
    expect(isValidExternalUrl("//evil.example.com")).toBe(false);
    expect(isValidExternalUrl("")).toBe(false);
  });
});

describe("toMonogram", () => {
  it("uses the capital letters of camel-cased names", () => {
    expect(toMonogram("GentleBook")).toBe("GB");
    expect(toMonogram("Admin Console")).toBe("AC");
  });

  it("falls back to the first two letters", () => {
    expect(toMonogram("hub")).toBe("HU");
    expect(toMonogram("Xero")).toBe("XE");
  });
});
