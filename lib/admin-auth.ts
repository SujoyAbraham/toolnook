/**
 * Server-only admin auth helpers. Used by the admin route handlers (Node
 * runtime) and the middleware (Edge runtime), so this module relies solely on
 * the Web Crypto API and process.env — no Node-only imports.
 *
 * Secrets (ADMIN_PASSWORD, ADMIN_SESSION_SECRET) are read from env at call
 * time and never returned to the client.
 */

const SESSION_MS = 24 * 60 * 60 * 1000; // 24 hours
// Deliberately generic cookie name — reveals nothing about what it protects.
export const SESSION_COOKIE = "tv_session";

export const sessionCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict" as const,
  path: "/",
  maxAge: SESSION_MS / 1000,
};

export const clearedCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict" as const,
  path: "/",
  maxAge: 0,
};

function requireSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  return secret;
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacHex(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return toHex(sig);
}

/** Constant-time comparison that does not short-circuit on length. */
function timingSafeEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

/**
 * Verify a submitted password against ADMIN_PASSWORD. Both values are HMAC'd to
 * fixed-length digests before comparison, so the check is timing-safe and never
 * branches on the submitted length.
 */
export async function verifyPassword(submitted: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("ADMIN_PASSWORD is not set");
  const secret = requireSecret();
  const [a, b] = await Promise.all([hmacHex(submitted, secret), hmacHex(expected, secret)]);
  return timingSafeEqual(a, b);
}

export async function createSessionToken(): Promise<string> {
  const expiry = String(Date.now() + SESSION_MS);
  const sig = await hmacHex(expiry, requireSecret());
  return `${expiry}.${sig}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot < 1) return false;
  const expiry = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expiryMs = Number(expiry);
  if (!Number.isFinite(expiryMs) || expiryMs < Date.now()) return false;
  let expected: string;
  try {
    expected = await hmacHex(expiry, requireSecret());
  } catch {
    return false;
  }
  return timingSafeEqual(sig, expected);
}

/**
 * Best-effort in-memory brute-force tracker keyed by IP. Serverless instances
 * do NOT share memory, so this only slows attackers that happen to hit the same
 * warm instance — the real defence is a long ADMIN_PASSWORD (20+ chars).
 */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, { count: number; first: number }>();

export function isRateLimited(ip: string): boolean {
  const entry = attempts.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.first > WINDOW_MS) {
    attempts.delete(ip);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.first > WINDOW_MS) {
    attempts.set(ip, { count: 1, first: now });
  } else {
    entry.count += 1;
  }
}

export function resetAttempts(ip: string): void {
  attempts.delete(ip);
}
