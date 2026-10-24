"use server";

/**
 * Authentication Server Actions — registration, login, logout.
 *
 * Security guarantees:
 * - All input is validated server-side with Zod before any DB interaction.
 * - Passwords are never stored plaintext — Argon2id hashes only.
 * - Role is hardcoded to MEMBER for public registration.
 * - Login failure messages are generic to prevent account enumeration.
 * - Session tokens are issued only after successful authentication.
 * - Password hashes are never returned in any response.
 */

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession } from "@/lib/auth/session";
import {
  RegisterSchema,
  LoginSchema,
} from "@/lib/validation/auth";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ActionState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export async function register(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // 1. Validate input server-side
  const parsed = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password } = parsed.data;
  // email is already normalized (lowercased + trimmed) by the Zod schema

  // 2. Check for duplicate email
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      errors: { email: ["An account with this email already exists."] },
    };
  }

  // 3. Hash password — never store plaintext
  const passwordHash = await hashPassword(password);

  // 4. Create user — role is always MEMBER for public registration
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "MEMBER", // hardcoded — never from client input
    },
    select: { id: true, role: true }, // never select passwordHash
  });

  // 5. Create session and redirect
  await createSession({ userId: user.id, role: user.role });
  redirect("/dashboard");
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

export async function login(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // 1. Validate input
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;

  // 2. Look up user — fetch passwordHash for verification only
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true, passwordHash: true },
  });

  // 3. Verify password — use constant-time comparison via argon2
  //    Generic message prevents account enumeration
  const GENERIC_ERROR = "Invalid email or password.";

  if (!user) {
    // Still run a dummy hash to prevent timing-based enumeration
    await hashPassword(password);
    return { message: GENERIC_ERROR };
  }

  const passwordValid = await verifyPassword(user.passwordHash, password);
  if (!passwordValid) {
    return { message: GENERIC_ERROR };
  }

  // 4. Create session — passwordHash is NOT included in the session payload
  await createSession({ userId: user.id, role: user.role });
  redirect("/dashboard");
}

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
