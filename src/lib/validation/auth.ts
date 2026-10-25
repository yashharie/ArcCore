/**
 * Server-side validation schemas for authentication forms.
 * These run on the server only — never in client bundles.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export const RegisterSchema = z.object({
  name: z
    .string({ error: "Name is required." })
    .min(2, { error: "Name must be at least 2 characters." })
    .max(100, { error: "Name must be at most 100 characters." })
    .trim(),

  email: z
    .string({ error: "Email is required." })
    .trim()
    .toLowerCase()
    .pipe(
      z
        .email({ error: "Please enter a valid email address." })
        .max(254, { error: "Email address is too long." })
    ),

  password: z
    .string({ error: "Password is required." })
    .min(8, { error: "Password must be at least 8 characters." })
    .max(128, { error: "Password must be at most 128 characters." })
    .regex(/[a-zA-Z]/, { error: "Password must contain at least one letter." })
    .regex(/[0-9]/, { error: "Password must contain at least one number." }),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

export const LoginSchema = z.object({
  email: z
    .string({ error: "Email is required." })
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: "Please enter a valid email address." })),

  password: z
    .string({ error: "Password is required." })
    .min(1, { error: "Password is required." }),
});

export type LoginInput = z.infer<typeof LoginSchema>;

// ---------------------------------------------------------------------------
// Profile update (allowed fields only)
// ---------------------------------------------------------------------------

export const UpdateProfileSchema = z.object({
  name: z
    .string({ error: "Name is required." })
    .min(2, { error: "Name must be at least 2 characters." })
    .max(100, { error: "Name must be at most 100 characters." })
    .trim()
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
