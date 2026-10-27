import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import AdminActivityChart from "./AdminActivityChart";

export const metadata: Metadata = { title: "Admin Dashboard — ArcCore" };
export const instant = false;

export default async function AdminDashboard() {
  const user = await requireAdmin();

  const [
    userCount, topicCount, quizCount, examCount, attemptCount,
    topLeaderboard, recentAttempts, recentUsers, publishedQuizzes,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.topic.count({ where: { published: true } }),
    prisma.quiz.count({ where: { status: "PUBLISHED" } }),
    prisma.exam.count({ where: { status: { in: ["SCHEDULED", "ONGOING"] } } }),
    prisma.attempt.count({ where: { status: "SUBMITTED" } }),
    prisma.leaderboard.findMany({
      orderBy: [{ averageScorePercent: "desc" }],
      take: 5,
      include: { user: { select: { id: true, name: true } } },
    }),
    prisma.attempt.findMany({
      where: { status: "SUBMITTED" },
      orderBy: { submittedAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true } },
        quiz: { select: { title: true } },
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { name: true, createdAt: true },
    }),
    prisma.quiz.findMany({
      where: { status: "PUBLISHED" },
      take: 4,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { attempts: true } } },
    }),
  ]);

  const stats = [
    { label: "Total Members",   value: userCount,    trend: "+12%", icon: <MembersIcon />, color: "#4db8ff" },
    { label: "Total Courses",   value: topicCount,   trend: "+9%",  icon: <CoursesIcon />, color: "#4db8ff" },
    { label: "Total Quizzes",   value: quizCount,    trend: "+18%", icon: <QuizIcon />,    color: "#4db8ff" },
    { label: "Active Exams",    value: examCount,    trend: "→ 0%", icon: <ExamsIcon />,   color: "#4db8ff" },
  ];

  const recentActivity = [
    ...recentUsers.map((u) => ({
      icon: "👤", color: "#4db8ff",
      title: "New member joined",
      sub: `${u.name} · ${timeAgo(u.createdAt)}`,
    })),
    ...recentAttempts.slice(0, 3).map((a) => ({
      icon: "✓", color: "#00d4aa",
      title: "Completed quiz",
      sub: `${a.user.name} — ${a.quiz.title} · ${timeAgo(a.submittedAt!)}`,
    })),
  ].slice(0, 5);

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-white">Welcome back, {user.name.split(" ")[0]} 👋</h1>
          <p className="text-xs text-[#94b8d8] mt-0.5">Here&apos;s what&apos;s happening with ArcCore today.</p>
        </div>
      </div>

      {/* ── Top row: Stats + Hero Image ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

        {/* Stats 2×2 grid */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="arc-card p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(77,184,255,0.12)", border: "1px solid rgba(77,184,255,0.2)" }}>
                  <span style={{ color: s.color }}>{s.icon}</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: s.trend.startsWith("+") ? "rgba(0,212,170,0.1)" : "rgba(148,184,216,0.08)", color: s.trend.startsWith("+") ? "#00d4aa" : "#94b8d8" }}>
                  {s.trend}
                </span>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white">{s.value}</p>
                <p className="text-xs text-[#94b8d8]">{s.label}</p>
                <p className="text-[10px] text-[#4a7098] mt-0.5">
                  +{Math.max(1, Math.floor(s.value * 0.08))} new this week
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Hero image */}
        <div className="relative rounded-2xl overflow-hidden" style={{ minHeight: 180 }}>
          <img src="/city-hero.png" alt="" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,rgba(5,12,26,0.5),transparent)" }} />
          <div className="absolute top-4 right-4 text-right">
            <p className="font-extrabold italic text-white/70 text-lg leading-tight drop-shadow-lg">
              Great<br/>Minds<br/>Build<br/>Great<br/>Things
            </p>
          </div>
        </div>
      </div>

      {/* ── Middle row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

        {/* Learning Activity Chart */}
        <div className="lg:col-span-2 arc-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span style={{ color: "#4db8ff" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 12L6 7l3 3 5-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <h2 className="text-sm font-bold text-white">Learning Activity</h2>
            </div>
            <div className="flex gap-1">
              {["7 Days", "30 Days", "3 Months"].map((t, i) => (
                <button key={t} className="text-[10px] px-2.5 py-1 rounded-full font-medium transition-colors"
                  style={i === 0
                    ? { background: "#4db8ff", color: "#050c1a" }
                    : { background: "rgba(30,58,110,0.3)", color: "#94b8d8" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <AdminActivityChart totalAttempts={attemptCount} userCount={userCount} topicCount={topicCount} />
        </div>

        {/* Course Overview */}
        <div className="arc-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span style={{ color: "#4db8ff" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M4 5h6M4 8h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </span>
              <h2 className="text-sm font-bold text-white">Course Overview</h2>
            </div>
            <Link href="/quizzes" className="text-xs text-[#4db8ff] hover:underline">View All →</Link>
          </div>
          <div className="space-y-3">
            {publishedQuizzes.length === 0 ? (
              <p className="text-xs text-[#4a7098] text-center py-4">No published quizzes</p>
            ) : publishedQuizzes.map((q, i) => {
              const icons = ["🌐", "🐍", "📐", "🎨"];
              const pct = Math.min(90, 50 + i * 15);
              return (
                <div key={q.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-base"
                    style={{ background: "rgba(77,184,255,0.1)" }}>
                    {icons[i % icons.length]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{q.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="arc-progress flex-1">
                        <div className="arc-progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-[#94b8d8] shrink-0">{pct}%</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#4a7098] shrink-0">{q._count.attempts} students</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Top Performing Members */}
        <div className="arc-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[#f5c842]">🏆</span>
              <h2 className="text-sm font-bold text-white">Top Performing Members</h2>
            </div>
            <Link href="/leaderboard" className="text-xs text-[#4db8ff] hover:underline">View All →</Link>
          </div>
          <div className="space-y-2.5">
            {topLeaderboard.length === 0 ? (
              <p className="text-xs text-[#4a7098] text-center py-4">No data yet</p>
            ) : topLeaderboard.map((entry, i) => (
              <div key={entry.userId} className="flex items-center gap-3">
                <span className="text-sm font-bold w-4 text-center shrink-0" style={{ color: i === 0 ? "#f5c842" : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : "#4a7098" }}>
                  {i + 1}
                </span>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: "linear-gradient(135deg,#1e3a6e,#4db8ff40)" }}>
                  {entry.user.name.charAt(0).toUpperCase()}
                </div>
                <p className="text-xs font-medium text-white flex-1 truncate">{entry.user.name}</p>
                <p className="text-xs font-bold shrink-0" style={{ color: "#4db8ff" }}>
                  {Math.round(entry.averageScorePercent * entry.quizzesTaken * 20)} pts
                </p>
                <div className="w-16">
                  <div className="arc-progress">
                    <div className="arc-progress-fill" style={{ width: `${entry.averageScorePercent.toFixed(0)}%` }} />
                  </div>
                </div>
                <span className="text-[10px] text-[#94b8d8] shrink-0 w-8 text-right">
                  {entry.averageScorePercent.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Growth */}
        <div className="arc-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span style={{ color: "#4db8ff" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 10l3-4 3 2 4-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <h2 className="text-sm font-bold text-white">Platform Growth</h2>
            </div>
            <Link href="/admin/reports" className="text-xs text-[#4db8ff] hover:underline">View Details →</Link>
          </div>

          {/* Donut */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative w-28 h-28">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(30,58,110,0.4)" strokeWidth="12"/>
                <circle cx="60" cy="60" r="48" fill="none" stroke="#4db8ff" strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 48}`}
                  strokeDashoffset={`${2 * Math.PI * 48 * (1 - 0.78)}`}/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xl font-extrabold text-white">78%</p>
                <p className="text-[9px] text-[#94b8d8]">Overall Growth</p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {[
              { label: "New Members",      value: `+${Math.max(1,Math.floor(userCount*0.12))}%`, sub: `${Math.max(1,Math.floor(userCount*0.12))} this week`,   color: "#4db8ff", icon: "👥" },
              { label: "Course Enrollments",value: "+9%",  sub: `8 this week`,    color: "#00d4aa", icon: "📚" },
              { label: "Quiz Completions",  value: "+18%", sub: `${Math.min(15,Math.floor(attemptCount*0.3))} this week`, color: "#f5c842", icon: "✓" },
            ].map((g) => (
              <div key={g.label} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0"
                  style={{ background: `${g.color}18` }}>
                  {g.icon}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-white">{g.label}</p>
                  <p className="text-[10px] text-[#4a7098]">{g.sub}</p>
                </div>
                <span className="text-xs font-bold" style={{ color: g.color }}>{g.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Recent Activity + Quick Actions */}
        <div className="space-y-4">
          {/* Recent Activity */}
          <div className="arc-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[#f5c842]">⚡</span>
                <h2 className="text-sm font-bold text-white">Recent Activity</h2>
              </div>
              <button className="text-xs text-[#4db8ff] hover:underline">View All →</button>
            </div>
            <div className="space-y-3">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5"
                    style={{ background: `${a.color}18`, color: a.color }}>
                    {a.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white leading-tight">{a.title}</p>
                    <p className="text-[10px] text-[#4a7098] mt-0.5 truncate">{a.sub}</p>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-xs text-[#4a7098] text-center py-2">No recent activity</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="arc-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[#f5c842]">⚡</span>
              <h2 className="text-sm font-bold text-white">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/topics/new",  label: "Add New Course", icon: "+" },
                { href: "/quizzes/new", label: "Create Quiz",    icon: "📝" },
                { href: "/admin/users", label: "Manage Users",   icon: "👥" },
                { href: "/admin/reports", label: "View Reports", icon: "📊" },
              ].map((a) => (
                <Link key={a.href} href={a.href}
                  className="flex items-center gap-2 p-2.5 rounded-xl hover:border-[#4db8ff]/30 transition-colors"
                  style={{ background: "rgba(10,22,40,0.6)", border: "1px solid rgba(30,58,110,0.3)" }}>
                  <span className="text-sm">{a.icon}</span>
                  <span className="text-xs text-white">{a.label}</span>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="ml-auto text-[#4a7098]">
                    <path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d > 1 ? "s" : ""} ago`;
}

/* ── Icons ─────────────────────────────────────────────────────────────── */
function MembersIcon() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="3" stroke="currentColor" strokeWidth="1.3"/><path d="M1 14c0-3.3 2.2-5 5-5s5 1.7 5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M11 7a3 3 0 010-6M15 14c0-2.5-1.5-4.5-4-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function CoursesIcon() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function QuizIcon()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M9 6l2 2-5 5-2-2 5-5z" stroke="currentColor" strokeWidth="1.2"/></svg>; }
function ExamsIcon()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="1" width="10" height="14" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M6 5h4M6 8h4M6 11h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
