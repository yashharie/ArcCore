/**
 * Server-side authorization helpers — server-only.
 *
 * Use these in Server Actions, Route Handlers, and Server Components to
 * enforce authentication and role-based access control.
 *
 * These functions verify from trusted server-side session data — never from
 * client-supplied role claims.
 */

import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser, type AuthenticatedUser } from "./getCurrentUser";

// ---------------------------------------------------------------------------
// Authentication guards
// ---------------------------------------------------------------------------

/**
 * Require an authenticated session.
 * Returns the current user, or redirects to /login if unauthenticated.
 * If the user must change their password, redirects to /change-password.
 * Use in Server Components and Server Actions.
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.mustChangePassword) redirect("/change-password");
  return user;
}

/**
 * Require an authenticated session for API Route Handlers.
 * Returns { user } on success, or { error, status: 401 } if unauthenticated.
 * Callers must return the error response when error is present.
 */
export async function requireAuthForApi(): Promise<
  | { user: AuthenticatedUser; error?: never }
  | { user?: never; error: Response }
> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      error: Response.json(
        { error: "Authentication required." },
        { status: 401 }
      ),
    };
  }
  return { user };
}

// ---------------------------------------------------------------------------
// Role guards
// ---------------------------------------------------------------------------

/**
 * Require the ADMIN role.
 * Returns the current user, or redirects if unauthenticated / not an admin.
 * Use in Server Components and Server Actions.
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    // Redirect members away from admin-only areas
    redirect("/dashboard");
  }
  return user;
}

/**
 * Require the ADMIN role for API Route Handlers.
 * Returns { user } or { error: 401/403 Response }.
 */
export async function requireAdminForApi(): Promise<
  | { user: AuthenticatedUser; error?: never }
  | { user?: never; error: Response }
> {
  const authResult = await requireAuthForApi();
  if (authResult.error) return authResult;

  const user = authResult.user;
  if (user.role !== "ADMIN") {
    return {
      error: Response.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      ),
    };
  }
  return { user };
}
