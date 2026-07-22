import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Minimal single-admin session auth.
// Token format: base64url(payload JSON) + "." + base64url(HMAC-SHA256 signature).
// Web Crypto only — works in Node route handlers AND Edge middleware.
// (NextAuth was the plan, but the corporate registry serves a conflicting
// "@auth/core" package, so its dependency tree cannot install. See README.)

export const SESSION_COOKIE = "af_admin";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

type SessionPayload = { email: string; exp: number };

function secretBytes(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

function b64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function hmacKey(usage: KeyUsage): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    secretBytes() as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    [usage]
  );
}

export async function createSessionToken(email: string): Promise<string> {
  const payload: SessionPayload = { email, exp: Date.now() + SESSION_TTL_MS };
  const payloadB64 = b64url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await hmacKey("sign");
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadB64) as BufferSource
  );
  return `${payloadB64}.${b64url(new Uint8Array(sig))}`;
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  const [payloadB64, sigB64] = token.split(".");
  if (!payloadB64 || !sigB64) return null;
  try {
    const key = await hmacKey("verify");
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      b64urlDecode(sigB64) as BufferSource,
      new TextEncoder().encode(payloadB64) as BufferSource
    );
    if (!valid) return null;
    const payload: SessionPayload = JSON.parse(
      new TextDecoder().decode(b64urlDecode(payloadB64))
    );
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Current admin session, or null. For pages/actions/routes (Node). */
export async function getAdminSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/** Guard for admin pages and server actions — redirects to login. */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
