/**
 * Next.js Proxy (formerly middleware) — session-based route protection.
 *
 * - Protected routes: redirects unauthenticated users to /login.
 * - Auth routes (/login, /register): redirects authenticated users to /dashboard.
 * - mustChangePassword: redirects to /change-password except when already there.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "arccore_session";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/profile",
  "/quizzes",
  "/topics",
  "/results",
  "/leaderboard",
  "/exams",
  "/admin",
];

// Auth routes — authenticated users should not see the login page
const AUTH_ROUTES = ["/login"];

// Routes a must-change-password user is allowed to access
const CHANGE_PASSWORD_ALLOWED = ["/change-password", "/api/auth/change-password"];

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
    if (typeof payload.userId !== "string" || typeof payload.role !== "string") {
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
