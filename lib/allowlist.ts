/** Parses a comma/whitespace separated list of e-mail addresses into a normalized set. */
export function parseAllowedEmails(value: string | undefined): Set<string> {
  return new Set(
    (value ?? "")
      .split(/[\s,;]+/)
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

/** True if the address is on the allowlist (case-insensitive). An empty allowlist allows nobody. */
export function isAllowedEmail(email: string | null | undefined, allowed: Set<string>): boolean {
  return !!email && allowed.has(email.trim().toLowerCase());
}

/** The allowlist configured via the ALLOWED_EMAILS environment variable. */
export function getAllowedEmails(): Set<string> {
  return parseAllowedEmails(process.env.ALLOWED_EMAILS);
}

/** "medin@gentlegroup.de" → "Medin" — used to show who last changed something. */
export function displayNameFromEmail(email: string | null | undefined): string {
  const local = (email ?? "").split("@")[0];
  return local ? local.charAt(0).toUpperCase() + local.slice(1) : "Unbekannt";
}
