/**
 * ArcCore — Shared authenticated navigation bar
 * Dark navy theme matching the UI mockup
 */

import Link from "next/link";
import Image from "next/image";
import { logout } from "@/app/actions/auth";
import type { AuthenticatedUser } from "@/lib/auth/getCurrentUser";

interface NavProps {
  user: AuthenticatedUser;
}

export default function Nav({ user }: NavProps) {
  const initial = user.name.charAt(0).toUpperCase();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-md"
      style={{ background: "rgba(5,12,26,0.92)" }}>
      <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <Image src="/logo.svg" alt="ArcCore" width={32} height={32} className="h-8 w-8" />
          <span className="font-extrabold text-base tracking-tight hidden sm:block">
            <span className="text-[#f5c842]">Arc</span>
            <span className="text-[#4db8ff]">Core</span>
          </span>
        </Link>

        {/* Centre links */}
        <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {[
            { href: "/dashboard", label: "Home" },
            { href: "/topics", label: "Courses" },
            { href: "/quizzes", label: "Quizzes" },
            { href: "/exams", label: "Community" },
            { href: "/admin", label: "About", adminOnly: true },
          ]
            .filter((l) => !l.adminOnly || user.role === "ADMIN")
            .map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#94b8d8] hover:text-white hover:bg-white/5 transition-colors"
              >
                {l.label}
              </Link>
            ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search icon */}
          <button className="hidden md:flex w-8 h-8 rounded-full items-center justify-center text-[#94b8d8] hover:text-white hover:bg-white/5 transition-colors">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Avatar + name */}
          <Link href="/profile" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: "linear-gradient(135deg,#1e3a6e,#4db8ff)" }}>
              {initial}
            </div>
            <span className="hidden sm:block text-xs font-medium text-[#94b8d8] group-hover:text-white transition-colors max-w-[80px] truncate">
              {user.name}
            </span>
          </Link>

          {/* Sign out */}
          <form action={logout}>
            <button
              type="submit"
              className="rounded-full border border-[#1e3a6e] px-3 py-1 text-xs font-medium text-[#94b8d8] hover:text-white hover:border-[#4db8ff]/40 transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
