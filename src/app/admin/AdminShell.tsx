"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import type { AuthenticatedUser } from "@/lib/auth/getCurrentUser";

const NAV = [
  { href: "/admin",          icon: <DashIcon />,    label: "Dashboard"   },
  { href: "/admin/users",    icon: <UsersIcon />,   label: "Users"       },
  { href: "/topics",         icon: <CoursesIcon />, label: "Courses"     },
  { href: "/quizzes",        icon: <QuizIcon />,    label: "Quizzes"     },
  { href: "/exams",          icon: <ExamsIcon />,   label: "Exams"       },
  { href: "/topics",         icon: <ContentIcon />, label: "Content"     },
  { href: "/leaderboard",    icon: <CommIcon />,    label: "Communities" },
  { href: "/admin/reports",  icon: <ReportIcon />,  label: "Reports"     },
  { href: "/profile",        icon: <SettingsIcon />,label: "Settings"    },
];

export default function AdminShell({ user, children }: { user: AuthenticatedUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ background: "#050c1a" }}>
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside
        className="fixed left-0 top-0 bottom-0 z-40 flex flex-col transition-all duration-200"
        style={{
          width: collapsed ? 64 : 220,
          background: "rgba(8,15,30,0.98)",
          borderRight: "1px solid rgba(30,58,110,0.35)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 h-14 shrink-0">
          <Image src="/logo.svg" alt="ArcCore" width={32} height={32} className="shrink-0" />
          {!collapsed && (
            <span className="font-extrabold text-base tracking-tight">
              <span style={{ color: "#f5c842" }}>Arc</span>
              <span style={{ color: "#4db8ff" }}>Core</span>
            </span>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-0.5">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link key={item.label + item.href} href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group"
                style={{
                  background: active ? "rgba(77,184,255,0.12)" : "transparent",
                  color: active ? "#4db8ff" : "#94b8d8",
                }}>
                <span className="shrink-0 w-5 h-5 flex items-center justify-center">{item.icon}</span>
                {!collapsed && (
                  <span className="text-xs font-medium group-hover:text-white transition-colors">{item.label}</span>
                )}
                {active && !collapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "#4db8ff" }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* City image at bottom */}
        {!collapsed && (
          <div className="mx-3 mb-3 rounded-xl overflow-hidden relative h-32 opacity-60">
            <img src="/city-hero.png" alt="" className="w-full h-full object-cover object-top" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(8,15,30,0.9),transparent)" }} />
            <div className="absolute bottom-2 left-3 right-3">
              <p className="text-[9px] font-bold text-white/60 italic leading-snug">Better<br/>Learning<br/>Bigger<br/>Future</p>
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)}
          className="mx-auto mb-4 w-6 h-6 rounded-full flex items-center justify-center text-[#4a7098] hover:text-white transition-colors"
          style={{ background: "rgba(30,58,110,0.3)" }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d={collapsed ? "M3 2l4 3-4 3" : "M7 2L3 5l4 3"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col" style={{ marginLeft: collapsed ? 64 : 220, transition: "margin 0.2s" }}>
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-14 flex items-center px-5 gap-4"
          style={{ background: "rgba(5,12,26,0.95)", borderBottom: "1px solid rgba(30,58,110,0.3)", backdropFilter: "blur(8px)" }}>
          {/* Search */}
          <div className="flex-1 max-w-sm hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(10,22,40,0.8)", border: "1px solid rgba(30,58,110,0.4)" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#4a7098]">
              <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input className="bg-transparent text-xs text-white placeholder-[#4a7098] outline-none flex-1"
              placeholder="Search users, courses, quizes..." />
          </div>

          <div className="flex-1" />

          {/* Notification bell */}
          <div className="relative">
            <button className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "rgba(10,22,40,0.6)", border: "1px solid rgba(30,58,110,0.4)" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#94b8d8]">
                <path d="M8 2a4 4 0 00-4 4v3l-1 2h10l-1-2V6a4 4 0 00-4-4z" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M6.5 13a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.3"/>
              </svg>
            </button>
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
              style={{ background: "#ff4d6d", color: "white" }}>3</span>
          </div>

          {/* Theme toggle placeholder */}
          <button className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(10,22,40,0.6)", border: "1px solid rgba(30,58,110,0.4)" }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="text-[#94b8d8]">
              <circle cx="7.5" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M3.2 3.2l1 1M10.8 10.8l1 1M10.8 3.2l-1 1M3.2 10.8l1-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Avatar */}
          <div className="flex items-center gap-2.5 pl-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: "linear-gradient(135deg,#1e3a6e,#4db8ff60)" }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-white leading-tight">{user.name.split(" ")[0]}</p>
              <p className="text-[10px] text-[#f5c842]">Admin</p>
            </div>
          </div>

          {/* Sign out */}
          <form action={logout}>
            <button type="submit" className="text-xs text-[#4a7098] hover:text-[#ff4d6d] transition-colors">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M5 2H3a1 1 0 00-1 1v9a1 1 0 001 1h2M10 10l3-3-3-3M13 7.5H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

/* ── Icons ────────────────────────────────────────────────────────────── */
function DashIcon()     { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/></svg>; }
function UsersIcon()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="3" stroke="currentColor" strokeWidth="1.3"/><path d="M1 14c0-3.3 2.2-5 5-5s5 1.7 5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M11 7a3 3 0 010-6M15 14c0-2.5-1.5-4.5-4-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function CoursesIcon()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function QuizIcon()     { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5 6h6M5 9h3M10 10l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="11" cy="10" r="2" stroke="currentColor" strokeWidth="1.2"/></svg>; }
function ExamsIcon()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="1" width="10" height="14" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M6 5h4M6 8h4M6 11h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function ContentIcon()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M3 8h10M3 12h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function CommIcon()     { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6l-3 2V4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>; }
function ReportIcon()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="8" width="3" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="6.5" y="5" width="3" height="9" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="11" y="2" width="3" height="12" rx="1" stroke="currentColor" strokeWidth="1.3"/></svg>; }
function SettingsIcon() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M8 1.5v1.2M8 13.3v1.2M1.5 8h1.2M13.3 8h1.2M3.4 3.4l.85.85M11.75 11.75l.85.85M11.75 3.4l-.85.85M4.25 11.75l-.85.85" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
