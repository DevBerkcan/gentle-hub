import { describe, expect, it } from "vitest";
import { extractLinks } from "@/lib/notes";

describe("extractLinks", () => {
  it("uses the text before the link as label", () => {
    expect(extractLinks("Dashboard: https://www.gentlebook.de/superadmin/dashboard")).toEqual([
      { label: "Dashboard", url: "https://www.gentlebook.de/superadmin/dashboard" },
    ]);
  });

  it("falls back to host + path and trims trailing punctuation", () => {
    expect(extractLinks("Siehe https://platform.openai.com/usage.")).toEqual([
      { label: "Siehe", url: "https://platform.openai.com/usage" },
    ]);
    expect(extractLinks("https://www.mollie.com/dashboard")).toEqual([
      { label: "www.mollie.com/dashboard", url: "https://www.mollie.com/dashboard" },
    ]);
  });

  it("finds several links, drops duplicates and ignores non-http schemes", () => {
    const notes = "A: https://a.example.com\nB: https://b.example.com\nnochmal https://a.example.com\njavascript:alert(1)";
    expect(extractLinks(notes).map((link) => link.url)).toEqual(["https://a.example.com", "https://b.example.com"]);
  });

  it("returns nothing for plain text", () => {
    expect(extractLinks("Idee: Erinnerungen per SMS")).toEqual([]);
  });
});
