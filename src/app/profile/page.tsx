import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/authorization";
import ProfileForm from "./ProfileForm";
import Nav from "@/components/Nav";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Profile — ArcCore",
  description: "Manage your ArcCore account profile.",
};

export const instant = false;

export default async function ProfilePage() {
  const user = await requireAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav user={user} />
      <div className="flex flex-col items-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Your Profile
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {user.email}{" "}
              <span className="ml-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                {user.role}
              </span>
            </p>
          </div>

          {/* Update name */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Display Name</h2>
            <ProfileForm currentName={user.name} />
          </div>

          {/* Change password */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-1">Password</h2>
            <p className="text-xs text-gray-500 mb-4">
              Update your password to keep your account secure.
            </p>
            <Link
              href="/change-password"
              className="inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              Change Password →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
