export type Role = "user" | "admin";

/** Legacy helper — still used to read ?role= query params on pages that
 *  haven't fully migrated. Kept for backward-compatibility with admin page. */
export function readRole(value: string | string[] | undefined): Role | "" {
  const role = Array.isArray(value) ? value[0] ?? "" : value ?? "";
  return role === "user" || role === "admin" ? role : "";
}

/** Hash a password using the Web Crypto API (SHA-256 + salt). */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Buffer.from(salt).toString("hex");
  const hash = await sha256(`${saltHex}:${password}`);
  return `${saltHex}:${hash}`;
}

/** Verify a plain-text password against a stored hash. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex] = stored.split(":");
  if (!saltHex) return false;
  const hash = await sha256(`${saltHex}:${password}`);
  const expected = `${saltHex}:${hash}`;
  // Constant-time comparison
  if (expected.length !== stored.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ stored.charCodeAt(i);
  }
  return mismatch === 0;
}

async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input),
  );
  return Buffer.from(buf).toString("hex");
}
