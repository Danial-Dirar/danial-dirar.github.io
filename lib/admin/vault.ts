/**
 * Encrypted credential vault for the /admin composer.
 *
 * The site is a static export with no server, so the GitHub token that publishes
 * posts has to live in the browser. Rather than storing a password hash and
 * comparing it — a check that is trivially bypassed in downloadable JavaScript —
 * the password *is* the key: PBKDF2 derives an AES-GCM key from it and the token
 * is stored only as ciphertext. A wrong password fails to decrypt, so there is
 * no boolean to flip and no token to steal from localStorage.
 */

const STORAGE_KEY = "danial-admin-vault";
const VERSION = 1;
const ITERATIONS = 600_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

/** Below this a PBKDF2 vault is guessable offline; enforced at setup. */
export const MIN_PASSWORD_LENGTH = 12;

export type RepoTarget = {
  owner: string;
  repo: string;
  branch: string;
};

/** What localStorage holds. Contains no secret recoverable without the password. */
export type StoredVault = RepoTarget & {
  v: number;
  salt: string;
  iv: string;
  ciphertext: string;
  iterations: number;
};

const toBase64 = (bytes: ArrayBuffer): string =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)));

const fromBase64 = (value: string): Uint8Array =>
  Uint8Array.from(atob(value), (c) => c.charCodeAt(0));

async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

const VAULT_EVENT = "danial-admin-vault-change";

// `useSyncExternalStore` compares snapshots by reference, so the parsed object
// is cached and only rebuilt when the underlying string actually changes.
let cachedRaw: string | null = null;
let cachedVault: StoredVault | null = null;

function parseVault(raw: string | null): StoredVault | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredVault;
    return parsed.v === VERSION ? parsed : null;
  } catch {
    return null;
  }
}

export function readVault(): StoredVault | null {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedVault = parseVault(raw);
  }
  return cachedVault;
}

/** Server/hydration snapshot: nothing is known until the client has mounted. */
export function readVaultOnServer(): undefined {
  return undefined;
}

/** `storage` covers other tabs; the custom event covers this one. */
export function subscribeToVault(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(VAULT_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(VAULT_EVENT, onChange);
  };
}

function announceChange(): void {
  window.dispatchEvent(new Event(VAULT_EVENT));
}

export function clearVault(): void {
  localStorage.removeItem(STORAGE_KEY);
  announceChange();
}

/** Encrypt `token` under `password` and persist it. Returns the stored record. */
export async function createVault(
  password: string,
  token: string,
  target: RepoTarget,
): Promise<StoredVault> {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveKey(password, salt, ITERATIONS);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    new TextEncoder().encode(token),
  );

  const vault: StoredVault = {
    v: VERSION,
    salt: toBase64(salt.buffer as ArrayBuffer),
    iv: toBase64(iv.buffer as ArrayBuffer),
    ciphertext: toBase64(ciphertext),
    iterations: ITERATIONS,
    ...target,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vault));
  announceChange();
  return vault;
}

/**
 * Recover the token. Rejects when the password is wrong — AES-GCM's
 * authentication tag fails to verify, which is the entire access check.
 */
export async function unlockVault(
  vault: StoredVault,
  password: string,
): Promise<string> {
  const key = await deriveKey(password, fromBase64(vault.salt), vault.iterations);
  let plaintext: ArrayBuffer;
  try {
    plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromBase64(vault.iv) as BufferSource },
      key,
      fromBase64(vault.ciphertext) as BufferSource,
    );
  } catch {
    throw new Error("Wrong password.");
  }
  return new TextDecoder().decode(plaintext);
}
