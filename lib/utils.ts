/** Joins class names, skipping falsy values. A minimal `clsx` to avoid an extra dependency. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Returns true if the given string is a safe, absolute http(s) URL. */
export function isValidExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/** One or two uppercase letters representing an application name, e.g. "GentleBook" → "GB". */
export function toMonogram(name: string): string {
  const capitals = name.replace(/[^A-ZÄÖÜ]/g, "");
  if (capitals.length >= 2) return capitals.slice(0, 2);
  return name.trim().slice(0, 2).toUpperCase();
}

const RELATIVE = new Intl.RelativeTimeFormat("de", { numeric: "auto" });

/** "vor 5 Minuten", "gestern", … for an ISO timestamp. */
export function formatRelativeTime(iso: string, now = Date.now()): string {
  const seconds = Math.round((Date.parse(iso) - now) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 45) return "gerade eben";
  if (abs < 3600) return RELATIVE.format(Math.round(seconds / 60), "minute");
  if (abs < 86_400) return RELATIVE.format(Math.round(seconds / 3600), "hour");
  if (abs < 2_592_000) return RELATIVE.format(Math.round(seconds / 86_400), "day");
  return new Date(iso).toLocaleDateString("de-DE");
}
