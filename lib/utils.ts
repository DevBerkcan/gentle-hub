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
