"use server";

/**
 * Profile Server Actions — update the authenticated user's profile.
 *
 * Security:
 * - User must be authenticated (redirects to /login if not).
 * - Only allowed fields (name) can be updated.
 * - Role and email cannot be changed via this action.
 * - passwordHash is never touched or returned.
 */

import { requireAuth } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { UpdateProfileSchema } from "@/lib/validation/auth";
import { revalidatePath } from "next/cache";

export type ProfileActionState =
  | {
      errors?: { name?: string[] };
      message?: string;
      success?: boolean;
    }
  | undefined;

export async function updateProfile(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  // Authentication check — redirects to /login if unauthenticated
  const user = await requireAuth();

  // Validate input
  const parsed = UpdateProfileSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const updates = parsed.data;
  if (Object.keys(updates).length === 0) {
    return { message: "No changes to save." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: updates,
    select: { id: true }, // minimal select — we don't need to return data here
  });

  // Revalidate the profile page so updated data is reflected
  revalidatePath("/profile");

  return { success: true };
}
