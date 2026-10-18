/**
 * End-to-end encrypted vault for credentials.
 *
 * The browser derives an AES-256-GCM key from the shared master password with
 * PBKDF2-SHA-256 and encrypts all entries into one blob. Only that blob is ever
 * sent to the server or stored in the database — never the key or plaintext.
 */

export const VAULT_VERSION = 1;
export const DEFAULT_ITERATIONS = 600_000;
const MAX_DATA_LENGTH = 1_000_000;

export type VaultEntry = { username?: string; password?: string; hint?: string };
export type VaultEntries = Record<string, VaultEntry>;

/** The encrypted form, safe to store and transmit. */
export type VaultBlob = { v: 1; iter: number; salt: string; iv: string; data: string };

/** An unlocked vault: key + salt are kept in memory only. */
export type OpenVault = { key: CryptoKey; salt: Uint8Array; iterations: number; entries: VaultEntries };

export class VaultPasswordError extends Error {
  constructor() {
    super("Falsches Master-Passwort.");
    this.name = "VaultPasswordError";
  }
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveKey(password: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt: new Uint8Array(salt), iterations },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/** Creates a new, empty vault protected by the given master password. */
export async function createVault(password: string, iterations = DEFAULT_ITERATIONS): Promise<OpenVault> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return { key: await deriveKey(password, salt, iterations), salt, iterations, entries: {} };
}

/** Encrypts the entries with a fresh IV. */
export async function sealVault(vault: OpenVault, entries: VaultEntries = vault.entries): Promise<VaultBlob> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(entries));
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, vault.key, plaintext));
  return { v: VAULT_VERSION, iter: vault.iterations, salt: toBase64(vault.salt), iv: toBase64(iv), data: toBase64(ciphertext) };
}

/** Decrypts a blob. Throws VaultPasswordError when the password is wrong. */
export async function openVault(blob: VaultBlob, password: string): Promise<OpenVault> {
  const salt = fromBase64(blob.salt);
  const key = await deriveKey(password, salt, blob.iter);
  let plaintext: ArrayBuffer;
  try {
    plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64(blob.iv) }, key, fromBase64(blob.data));
  } catch {
    throw new VaultPasswordError();
  }
  const parsed: unknown = JSON.parse(new TextDecoder().decode(plaintext));
  return { key, salt, iterations: blob.iter, entries: isEntries(parsed) ? parsed : {} };
}

function isEntries(value: unknown): value is VaultEntries {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  return Object.values(value).every(
    (entry) =>
      typeof entry === "object" &&
      entry !== null &&
      Object.values(entry).every((field) => typeof field === "string")
  );
}

const BASE64 = /^[A-Za-z0-9+/]*={0,2}$/;

/** Structural check of an encrypted blob — used by the server before storing it. */
export function isVaultBlob(value: unknown): value is VaultBlob {
  if (typeof value !== "object" || value === null) return false;
  const blob = value as Record<string, unknown>;
  return (
    blob.v === VAULT_VERSION &&
    typeof blob.iter === "number" &&
    Number.isInteger(blob.iter) &&
    blob.iter >= 100_000 &&
    blob.iter <= 10_000_000 &&
    typeof blob.salt === "string" &&
    BASE64.test(blob.salt) &&
    blob.salt.length <= 64 &&
    typeof blob.iv === "string" &&
    BASE64.test(blob.iv) &&
    blob.iv.length <= 32 &&
    typeof blob.data === "string" &&
    BASE64.test(blob.data) &&
    blob.data.length > 0 &&
    blob.data.length <= MAX_DATA_LENGTH &&
    Object.keys(blob).length === 5
  );
}
