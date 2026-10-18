import { isValidExternalUrl } from "@/lib/utils";

export type NoteLink = { label: string; url: string };

const URL_PATTERN = /https?:\/\/[^\s<>"'`]+/gi;

function trimTrailingPunctuation(url: string): string {
  return url.replace(/[.,;:!?)\]}]+$/, "");
}

/**
 * Finds http(s) links in notes so they can be shown as clickable links.
 * For lines like "Dashboard: https://…" the text before the link becomes the label;
 * otherwise the host + path is used. Duplicates are dropped, unsafe URLs ignored.
 */
export function extractLinks(notes: string): NoteLink[] {
  const seen = new Set<string>();
  const links: NoteLink[] = [];

  for (const line of notes.split(/\r?\n/)) {
    for (const match of line.matchAll(URL_PATTERN)) {
      const url = trimTrailingPunctuation(match[0]);
      if (seen.has(url) || !isValidExternalUrl(url)) continue;
      seen.add(url);

      const before = line.slice(0, match.index).replace(/[\s:–—-]+$/, "").trim();
      const { host, pathname } = new URL(url);
      const fallback = host + (pathname === "/" ? "" : pathname);
      links.push({ label: before && before.length <= 60 ? before : fallback, url });
    }
  }
  return links;
}
