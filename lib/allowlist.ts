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

/**
 * Wraps a mail sender so links are only ever sent to allowlisted addresses.
 * For other addresses it resolves silently — the caller sees the same response
 * either way, so the allowlist cannot be probed from the login form.
 */
export function createMagicLinkSender(
  send: (message: { to: string; url: string }) => Promise<void>,
  getAllowed: () => Set<string> = getAllowedEmails
) {
  return async ({ email, url }: { email: string; url: string }): Promise<void> => {
    if (!isAllowedEmail(email, getAllowed())) return;
    await send({ to: email.trim().toLowerCase(), url });
  };
}

/** "medin@gentlegroup.de" → "Medin" — used to show who last changed something. */
export function displayNameFromEmail(email: string | null | undefined): string {
  const local = (email ?? "").split("@")[0];
  return local ? local.charAt(0).toUpperCase() + local.slice(1) : "Unbekannt";
}
