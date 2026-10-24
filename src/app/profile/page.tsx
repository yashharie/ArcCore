import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/authorization";
import ProfileForm from "./ProfileForm";

export const metadata: Metadata = {
  title: "Profile — ArcCore",
  description: "Manage your ArcCore account profile.",
};

// This page reads cookies (session) — opt out of static prerendering
export const instant = false;

export default async function ProfilePage() {
  const user = await requireAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Your Profile
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {user.email}{" "}
            <span className="ml-1 rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              {user.role}
            </span>
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <ProfileForm currentName={user.name} />
        </div>
      </div>
    </div>
  );
}
