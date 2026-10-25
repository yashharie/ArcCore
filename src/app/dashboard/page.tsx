import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/authorization";
import { logout } from "@/app/actions/auth";

export const metadata: Metadata = {
  title: "Dashboard — ArcCore",
  description: "Your ArcCore learning dashboard.",
};

// This page reads cookies (session) — opt out of static prerendering
export const instant = false;


export default async function DashboardPage() {
  // Server-side auth check — redirects to /login if unauthenticated
  const user = await requireAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Welcome back, <span className="font-medium text-zinc-900 dark:text-zinc-100">{user.name}</span>!
        </p>
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
          Role: {user.role}
        </p>

        <form action={logout} className="mt-6">
          <button
            id="logout-button"
            type="submit"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
