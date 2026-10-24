/**
 * Next.js Proxy (formerly middleware) — session-based route protection.
 *
 * Runs on every request matching the configured pattern.
 * - Protected routes: redirects unauthenticated users to /login.
 * - Auth routes (/login, /register): redirects already-authenticated users to /dashboard.
 * - Public routes: no check.
 *
 * Note: The `middleware` file convention is deprecated in Next.js 16.
 * This file uses the new `proxy.ts` convention with the named `proxy` export.
 *
 * Security: middleware reads the session JWT from the cookie and validates it
 * using jose (same key as session.ts). The role is read from the token for
 * redirect decisions — all actual authorization is re-verified server-side
 * inside each handler/action.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Must match the cookie name in session.ts
const SESSION_COOKIE = "arccore_session";

// Routes that require an authenticated session
const PROTECTED_PREFIXES = ["/dashboard", "/profile"];

// Auth routes — authenticated users should not see these
const AUTH_ROUTES = ["/login", "/register"];

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

async function getSessionFromRequest(
  request: NextRequest
): Promise<{ userId: string; role: string } | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
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
    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isProtected) {
    const session = await getSessionFromRequest(request);
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isAuthRoute) {
    const session = await getSessionFromRequest(request);
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image  (image optimization)
     * - favicon.ico  (favicon)
     * - public files (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
