/**
 * Next.js Proxy — route protection + role-based redirects.
 *
 * - Protected routes: redirects unauthenticated users to /login.
 * - Root /: redirects logged-in users to their role-based home.
 * - /login: redirects logged-in users to their role-based home.
 * - mustChangePassword (non-admin): redirects to /change-password.
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
  "/change-password",
];

const AUTH_ROUTES = ["/login"];

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

/** Returns the home URL for a logged-in user based on role */
function roleHome(role: string, base: string): URL {
  return new URL(role === "ADMIN" ? "/admin" : "/dashboard", base);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Root page — redirect logged-in users to their home ──────────
  if (pathname === "/") {
    const session = await getSessionFromRequest(request);
    if (session) {
      return NextResponse.redirect(roleHome(session.role, request.url));
    }
    return NextResponse.next();
  }

  // ── 2. Protected routes — must be authenticated ────────────────────
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected) {
    const session = await getSessionFromRequest(request);
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ── 3. Auth routes (/login) — redirect logged-in users ────────────
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isAuthRoute) {
    const session = await getSessionFromRequest(request);
    if (session) {
      return NextResponse.redirect(roleHome(session.role, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
