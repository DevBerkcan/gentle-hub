export const MIN_PASSWORD_LENGTH = 12;
export const MAX_PASSWORD_LENGTH = 128;

/** Returns an error message, or null if the password is acceptable. */
export function checkPassword(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) return `Mindestens ${MIN_PASSWORD_LENGTH} Zeichen.`;
  if (password.length > MAX_PASSWORD_LENGTH) return `Höchstens ${MAX_PASSWORD_LENGTH} Zeichen.`;
  return null;
}
