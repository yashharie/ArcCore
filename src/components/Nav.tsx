/**
 * Shared authenticated navigation bar.
 */

import Link from "next/link";
import Image from "next/image";
import { logout } from "@/app/actions/auth";
import type { AuthenticatedUser } from "@/lib/auth/getCurrentUser";

interface NavProps {
  user: AuthenticatedUser;
}

export default function Nav({ user }: NavProps) {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2 sticky top-0 z-10 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo.svg"
            alt="ArcCore"
            width={36}
            height={36}
            className="h-9 w-9"
          />
          <span className="font-bold text-lg tracking-tight hidden sm:block">
            <span className="text-yellow-500">Arc</span>
            <span className="text-indigo-600">Core</span>
          </span>
        </Link>

        {/* Centre nav links */}
        <div className="hidden md:flex items-center gap-1 text-sm flex-1 justify-center">
          <NavLink href="/quizzes">📝 Quizzes</NavLink>
          <NavLink href="/topics">📚 Topics</NavLink>
          <NavLink href="/exams">📋 Exams</NavLink>
          <NavLink href="/leaderboard">🏆 Leaderboard</NavLink>
          <NavLink href="/results">📊 My Results</NavLink>
          {user.role === "ADMIN" && (
            <NavLink href="/admin">🛡️ Admin</NavLink>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/profile"
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className="hidden sm:inline font-medium">{user.name}</span>
            {user.role === "ADMIN" && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                Admin
              </span>
            )}
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors font-medium text-xs"
    >
      {children}
    </Link>
  );
}
