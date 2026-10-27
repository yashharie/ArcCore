"use server";

/**
 * Authentication Server Actions — login and logout only.
 *
 * Member accounts are created by admins only (not by self-registration).
 */

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession } from "@/lib/auth/session";
import { LoginSchema } from "@/lib/validation/auth";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ActionState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

export async function login(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      role: true,
      passwordHash: true,
      tempPasswordHash: true,
      tempPasswordExpiresAt: true,
      mustChangePassword: true,
    },
  });

  const GENERIC_ERROR = "Invalid email or password.";

  if (!user) {
    await hashPassword(password); // timing-safe dummy
    return { message: GENERIC_ERROR };
  }

  // Try main password
  let passwordValid = await verifyPassword(user.passwordHash, password);

  // Fall back to a valid non-expired temp password
  if (!passwordValid && user.tempPasswordHash) {
    const notExpired =
      !user.tempPasswordExpiresAt || user.tempPasswordExpiresAt > new Date();
    if (notExpired) {
      passwordValid = await verifyPassword(user.tempPasswordHash, password);
    }
  }

  if (!passwordValid) {
    return { message: GENERIC_ERROR };
  }

  await createSession({ userId: user.id, role: user.role });

  if (user.mustChangePassword && user.role !== "ADMIN") {
    redirect("/change-password");
  }

  redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
}

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
