/**
 * Session management utilities — server-only.
 *
 * Implements stateless JWT sessions using jose (HS256).
 * Sessions are stored in an HttpOnly, Secure (production) cookie.
 *
 * Security properties:
 * - Cookie is HttpOnly — JavaScript cannot access it.
 * - Cookie is Secure in production — only sent over HTTPS.
 * - SameSite=lax — CSRF protection for state-changing requests.
 * - JWT is signed with HS256 — tampering is detected.
 * - Payload contains only userId and role — no PII, no passwords.
 * - Expiry is enforced by jose on every decode.
 */

import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { UserRole } from "../../../generated/prisma/enums";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SESSION_COOKIE = "arccore_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET environment variable is not set. " +
        "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('base64url'))\""
    );
  }
  return new TextEncoder().encode(secret);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SessionPayload {
  userId: string;
  role: UserRole;
}

// ---------------------------------------------------------------------------
// JWT helpers
// ---------------------------------------------------------------------------

/**
 * Encrypt a session payload into a signed JWT string.
 * The token expires after SESSION_DURATION_MS.
 */
async function encryptSession(payload: SessionPayload): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getSecretKey());
}

/**
 * Verify and decrypt a JWT string. Returns the payload or null if invalid/expired.
 */
async function decryptSession(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    if (
      typeof payload.userId !== "string" ||
      typeof payload.role !== "string"
    ) {
      return null;
    }
    return { userId: payload.userId, role: payload.role as UserRole };
  } catch {
    // Token is expired, malformed, or has an invalid signature.
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cookie operations
// ---------------------------------------------------------------------------

/**
 * Create a new session and set the session cookie.
 * Call this after successful login or registration.
 */
export async function createSession(payload: SessionPayload): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const token = await encryptSession(payload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/**
 * Read and verify the current session from the cookie.
 * Returns the session payload or null if unauthenticated/expired.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return decryptSession(token);
}

/**
 * Refresh the session expiry (sliding window).
 * Call in middleware or layout to keep active sessions alive.
 */
export async function refreshSession(): Promise<void> {
  const session = await getSession();
  if (!session) return;
  await createSession(session); // reissues with a new expiry
}

/**
 * Delete the session cookie, effectively logging the user out.
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
