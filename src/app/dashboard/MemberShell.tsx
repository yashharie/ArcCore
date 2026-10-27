"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import type { AuthenticatedUser } from "@/lib/auth/getCurrentUser";

const NAV = [
  { href: "/dashboard",   icon: <DashIcon />,     label: "Dashboard"   },
  { href: "/quizzes",     icon: <QuizIcon />,     label: "Quizzes"     },
  { href: "/topics",      icon: <CoursesIcon />,  label: "Courses"     },
  { href: "/exams",       icon: <ExamsIcon />,    label: "Community"   },
  { href: "/leaderboard", icon: <LeaderIcon />,   label: "Leaderboard" },
  { href: "/results",     icon: <ResultsIcon />,  label: "My Results"  },
  { href: "/profile",     icon: <SettingsIcon />, label: "Settings"    },
];

interface Props {
  user: AuthenticatedUser;
  level: number;
  xpCurrent: number;
  xpMax: number;
  stats: {
    coursesEnrolled: number;
    quizzesTaken: number;
    totalPoints: number;
    rank: number | null;
    avgScore: number;
  };
  attempts: { id: string; title: string; pct: number }[];
  topics: { id: string; title: string; description: string | null; views: number }[];
  recentActivity: { icon: string; color: string; title: string; sub: string; time: string }[];
  availableQuizzes: number;
  totalTopics: number;
}

const COURSE_ICONS = ["🌐", "⚛️", "📐", "🎨", "🐍", "💼", "🔐", "📊"];

export default function MemberShell({
  user, level, xpCurrent, xpMax,
  stats, attempts, topics, recentActivity,
  availableQuizzes, totalTopics,
}: Props) {
  const pathname   = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen" style={{ background: "#050c1a" }}>

      {/* ── Sidebar ────────────────────────────────────────────────── */}
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

        {/* Avatar + level block */}
        {!collapsed && (
          <div className="mx-3 mb-2 p-3 rounded-xl" style={{ background: "rgba(30,58,110,0.2)", border: "1px solid rgba(30,58,110,0.3)" }}>
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-base font-extrabold shrink-0"
                style={{ background: "linear-gradient(135deg,#1e3a6e,#4db8ff60)", border: "2px solid rgba(77,184,255,0.4)" }}>
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.name.split(" ")[0]}</p>
                <p className="text-[10px] text-[#94b8d8]">Level {level} Member</p>
              </div>
            </div>
            {/* XP bar */}
            <div>
              <div className="flex justify-between text-[10px] text-[#4a7098] mb-1">
                <span>XP Progress</span>
                <span>{xpCurrent}/{xpMax}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(30,58,110,0.4)" }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((xpCurrent / xpMax) * 100)}%`, background: "linear-gradient(to right,#4db8ff,#00d4aa)" }} />
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-2 overflow-y-auto space-y-0.5">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group"
                style={{
                  background: active ? "rgba(77,184,255,0.12)" : "transparent",
                  color:      active ? "#4db8ff" : "#94b8d8",
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

        {/* City image */}
        {!collapsed && (
          <div className="mx-3 mb-3 rounded-xl overflow-hidden relative h-28 opacity-50">
            <img src="/city-hero.png" alt="" className="w-full h-full object-cover object-top" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(8,15,30,0.9),transparent)" }} />
            <div className="absolute bottom-2 left-3">
              <p className="text-[9px] font-bold text-white/60 italic leading-snug">Better<br/>Learning<br/>Bigger<br/>Future</p>
            </div>
          </div>
        )}

        {/* Collapse */}
        <button onClick={() => setCollapsed(!collapsed)}
          className="mx-auto mb-4 w-6 h-6 rounded-full flex items-center justify-center text-[#4a7098] hover:text-white transition-colors"
          style={{ background: "rgba(30,58,110,0.3)" }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d={collapsed ? "M3 2l4 3-4 3" : "M7 2L3 5l4 3"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </aside>

      {/* ── Main ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col" style={{ marginLeft: collapsed ? 64 : 220, transition: "margin 0.2s" }}>

        {/* Topbar */}
        <header className="sticky top-0 z-30 h-14 flex items-center px-5 gap-3"
          style={{ background: "rgba(5,12,26,0.95)", borderBottom: "1px solid rgba(30,58,110,0.3)", backdropFilter: "blur(8px)" }}>
          {/* Search */}
          <div className="flex-1 max-w-sm hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(10,22,40,0.8)", border: "1px solid rgba(30,58,110,0.4)" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#4a7098] shrink-0">
              <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input className="bg-transparent text-xs text-white placeholder-[#4a7098] outline-none flex-1"
              placeholder="Search courses, quizzes..." />
          </div>
          <div className="flex-1" />

          {/* Avatar */}
          <Link href="/profile" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: "linear-gradient(135deg,#1e3a6e,#4db8ff60)" }}>
              {initial}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-white leading-tight group-hover:text-[#4db8ff] transition-colors">{user.name.split(" ")[0]}</p>
              <p className="text-[10px]" style={{ color: "#94b8d8" }}>Member</p>
            </div>
          </Link>

          {/* Sign out */}
          <form action={logout}>
            <button type="submit" title="Sign out"
              className="w-8 h-8 flex items-center justify-center rounded-full text-[#4a7098] hover:text-[#ff4d6d] hover:bg-white/5 transition-colors">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M5 2H3a1 1 0 00-1 1v9a1 1 0 001 1h2M10 10l3-3-3-3M13 7.5H6"
                  stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>
        </header>

        {/* ── Page content ─────────────────────────────────────────── */}
        <main className="flex-1 overflow-auto p-6">

          {/* Greeting + hero */}
          <div className="relative rounded-2xl overflow-hidden mb-6 p-6"
            style={{ background: "linear-gradient(135deg,#0a1628,#0d2040)", border: "1px solid rgba(30,58,110,0.4)", minHeight: 160 }}>
            <div className="absolute inset-0 opacity-25">
              <img src="/city-hero.png" alt="" className="w-full h-full object-cover object-top" />
            </div>
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right,#050c1a 35%,transparent)" }} />
            <div className="absolute top-4 right-6 text-right pointer-events-none">
              <p className="font-extrabold italic text-white/30 text-lg leading-tight">
                Great<br/>Minds<br/>Build<br/>Great<br/>Things
              </p>
            </div>
            <div className="relative z-10">
              <p className="text-xs font-semibold tracking-widest text-[#94b8d8] uppercase mb-1">
                Hello, {user.name.split(" ")[0]} 👋
              </p>
              <h1 className="text-2xl font-extrabold text-white mb-0.5">
                Here&apos;s what&apos;s keeping you ahead.
              </h1>
              <p className="text-xs text-[#94b8d8] mb-4">Your personal learning hub</p>
              <div className="flex gap-3">
                <Link href="/quizzes" className="arc-btn text-xs px-5">Take a Quiz →</Link>
                <Link href="/topics" className="arc-btn-outline text-xs px-5">Browse Courses</Link>
              </div>
            </div>
          </div>

          {/* ── Stats ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { icon: "📚", label: "Courses Enrolled", value: stats.coursesEnrolled, color: "#4db8ff",  trend: `${availableQuizzes} available` },
              { icon: "📝", label: "Quizzes Taken",    value: stats.quizzesTaken,    color: "#f5c842",  trend: "All time"                     },
              { icon: "⭐", label: "Total Points",     value: stats.totalPoints,     color: "#00d4aa",  trend: `${stats.avgScore}% avg score`  },
              { icon: "🏆", label: "Global Rank",      value: stats.rank ? `#${stats.rank}` : "—", color: "#f5c842", trend: "Leaderboard" },
            ].map((s) => (
              <div key={s.label} className="arc-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ background: `${s.color}15`, border: `1px solid ${s.color}25` }}>
                    {s.icon}
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(77,184,255,0.08)", color: "#94b8d8" }}>
                    {s.trend}
                  </span>
                </div>
                <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-[#94b8d8] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── Middle row ─────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

            {/* My Learning Progress */}
            <div className="lg:col-span-2 arc-card p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span style={{ color: "#4db8ff" }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 10l3-4 3 2 4-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <h2 className="text-sm font-bold text-white">My Learning Progress</h2>
                </div>
                <Link href="/results" className="text-xs text-[#4db8ff] hover:underline">View All →</Link>
              </div>

              {attempts.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-3">🚀</div>
                  <p className="text-[#94b8d8] text-sm mb-4">No quizzes completed yet.</p>
                  <Link href="/quizzes" className="arc-btn text-xs">Start your first quiz</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {attempts.map((a, i) => (
                    <Link key={a.id} href={`/results/${a.id}`}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm"
                        style={{ background: "rgba(77,184,255,0.1)" }}>
                        {COURSE_ICONS[i % COURSE_ICONS.length]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{a.title}</p>
                        <div className="arc-progress mt-1.5">
                          <div className="arc-progress-fill" style={{ width: `${a.pct}%` }} />
                        </div>
                      </div>
                      <span className="text-xs font-extrabold shrink-0"
                        style={{ color: a.pct >= 70 ? "#00d4aa" : a.pct >= 50 ? "#f5c842" : "#ff4d6d" }}>
                        {a.pct}%
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="arc-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[#f5c842]">⚡</span>
                  <h2 className="text-sm font-bold text-white">Recent Activity</h2>
                </div>
                <Link href="/results" className="text-xs text-[#4db8ff] hover:underline">View All →</Link>
              </div>

              {recentActivity.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-[#4a7098]">No activity yet.</p>
                  <Link href="/quizzes" className="arc-btn mt-3 text-xs inline-flex">Take a quiz</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((a, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5"
                        style={{ background: `${a.color}18`, color: a.color }}>
                        {a.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-white leading-tight">{a.title}</p>
                        <p className="text-[10px] text-[#4a7098] mt-0.5 truncate">{a.sub}</p>
                        <p className="text-[10px] text-[#4a7098]">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Bottom row ─────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Available Courses */}
            <div className="lg:col-span-2 arc-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span style={{ color: "#4db8ff" }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                      <path d="M4 5h6M4 8h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <h2 className="text-sm font-bold text-white">Available Courses</h2>
                </div>
                <Link href="/topics" className="text-xs text-[#4db8ff] hover:underline">View All →</Link>
              </div>

              {topics.length === 0 ? (
                <p className="text-xs text-[#4a7098] text-center py-6">No courses published yet.</p>
              ) : (
                <div className="space-y-3">
                  {topics.map((t, i) => (
                    <Link key={t.id} href={`/topics/${t.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-base"
                        style={{ background: "rgba(77,184,255,0.1)" }}>
                        {COURSE_ICONS[i % COURSE_ICONS.length]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{t.title}</p>
                        {t.description && (
                          <p className="text-[10px] text-[#4a7098] mt-0.5 truncate">{t.description}</p>
                        )}
                      </div>
                      <span className="text-[10px] text-[#94b8d8] shrink-0">{t.views} views</span>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[#4a7098] group-hover:text-[#4db8ff] transition-colors shrink-0">
                        <path d="M3 6h6M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="arc-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#f5c842]">⚡</span>
                <h2 className="text-sm font-bold text-white">Quick Actions</h2>
              </div>
              <div className="space-y-2">
                {[
                  { href: "/quizzes",    icon: "📝", label: "Browse Quizzes",  sub: `${availableQuizzes} available` },
                  { href: "/topics",     icon: "📚", label: "Browse Courses",  sub: `${totalTopics} courses`        },
                  { href: "/leaderboard",icon: "🏆", label: "Leaderboard",     sub: "See rankings"                  },
                  { href: "/exams",      icon: "📋", label: "Upcoming Exams",  sub: "Scheduled"                     },
                  { href: "/results",    icon: "📊", label: "My Results",      sub: "Past attempts"                  },
                  { href: "/profile",    icon: "⚙️", label: "Settings",        sub: "Profile & security"             },
                ].map((item) => (
                  <Link key={item.href} href={item.href}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group">
                    <span className="text-base shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white group-hover:text-[#4db8ff] transition-colors">{item.label}</p>
                      <p className="text-[10px] text-[#4a7098]">{item.sub}</p>
                    </div>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[#4a7098] group-hover:text-[#4db8ff] transition-colors shrink-0">
                      <path d="M3 6h6M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ── Icons ─────────────────────────────────────────────────────────────── */
function DashIcon()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/></svg>; }
function QuizIcon()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5 6h6M5 9h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M10 9l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>; }
function CoursesIcon() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function ExamsIcon()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="1" width="10" height="14" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M6 5h4M6 8h4M6 11h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function LeaderIcon()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 14h3v-5H2zM6.5 14h3V5h-3zM11 14h3V2h-3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>; }
function ResultsIcon() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function SettingsIcon(){ return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M8 1.5v1.2M8 13.3v1.2M1.5 8h1.2M13.3 8h1.2M3.4 3.4l.85.85M11.75 11.75l.85.85M11.75 3.4l-.85.85M4.25 11.75l-.85.85" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
