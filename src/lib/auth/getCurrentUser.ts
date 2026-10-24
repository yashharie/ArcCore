/**
 * getCurrentUser — server-only helper for other ArcCore modules.
 *
 * Returns the currently authenticated user (without passwordHash),
 * or null if the session is missing, expired, or invalid.
 *
 * Usage in Server Components, Server Actions, and Route Handlers:
 *
 *   import { getCurrentUser } from "@/lib/auth/getCurrentUser";
 *
 *   const user = await getCurrentUser();
 *   if (!user) redirect("/login");
 */

import "server-only";
import { getSession } from "./session";
import { prisma } from "@/lib/prisma";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  createdAt: Date;
}

/**
 * Retrieve the authenticated user from the current session.
 * Fetches a fresh record from the database — never trusts stale session data alone.
 * Returns null if unauthenticated, session is invalid/expired, or user no longer exists.
 * Never returns passwordHash.
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      // passwordHash is intentionally excluded
    },
  });

  return user ?? null;
}
