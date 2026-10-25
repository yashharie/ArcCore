// Force-password-change page.
// Shown to new members on first login and to members given a temp password by admin.

import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { redirect } from "next/navigation";
import ChangePasswordForm from "./ChangePasswordForm";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Set Your Password — ArcCore",
};

export const instant = false;

export default async function ChangePasswordPage() {
  const user = await getCurrentUser();

  // Not logged in → go to login
  if (!user) redirect("/login");

  // Already changed → go to dashboard
  if (!user.mustChangePassword) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src="/logo.svg" alt="ArcCore" width={80} height={80} priority />
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Set Your Password</h1>
          <p className="mt-2 text-sm text-gray-500">
            Hi <span className="font-semibold">{user.name}</span> — please set a
            personal password before continuing.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <ChangePasswordForm isFirstTime />
        </div>
      </div>
    </div>
  );
}
