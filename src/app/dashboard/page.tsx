import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata: Metadata = { title: "Dashboard — ArcCore" };
export const instant = false;

const COURSE_ICONS = ["🌐", "⚛️", "📐", "🎨", "🐍", "💼", "🔐", "📊"];

export default async function DashboardPage() {
  const user = await requireAuth();

  const [attempts, topicsViewed, leaderboardEntry, availableQuizzes, totalTopics, allTopics] =
    await Promise.all([
      prisma.attempt.findMany({
        where: { userId: user.id, status: "SUBMITTED" },
        include: { quiz: { select: { id: true, title: true } } },
        orderBy: { submittedAt: "desc" },
        take: 5,
      }),
      prisma.topicProgress.count({ where: { userId: user.id } }),
      prisma.leaderboard.findUnique({ where: { userId: user.id } }),
      prisma.quiz.count({ where: { status: "PUBLISHED" } }),
      prisma.topic.count({ where: { published: true } }),
      prisma.topic.findMany({
        where: { published: true },
        take: 4,
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, description: true, _count: { select: { topicProgress: true } } },
      }),
    ]);

  const totalScore = attempts.reduce((s, a) => s + a.score, 0);
  const totalMax   = attempts.reduce((s, a) => s + a.totalMarks, 0);
  const avgScore   = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

  const stats = [
    { icon: "📚", label: "Courses Enrolled", value: topicsViewed,       color: "#4db8ff", sub: `${availableQuizzes} quizzes available` },
    { icon: "📝", label: "Quizzes Taken",    value: attempts.length,    color: "#f5c842", sub: "All time"                              },
    { icon: "⭐", label: "Total Points",     value: totalScore,         color: "#00d4aa", sub: `${avgScore}% avg score`               },
    { icon: "🏆", label: "Global Rank",      value: leaderboardEntry?.rank ? `#${leaderboardEntry.rank}` : "—", color: "#f5c842", sub: "Leaderboard" },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden mb-6 p-6"
        style={{ background: "linear-gradient(135deg,#0a1628,#0d2040)", border: "1px solid rgba(30,58,110,0.4)", minHeight: 150 }}>
        <div className="absolute inset-0 opacity-25">
          <img src="/city-hero.png" alt="" className="w-full h-full object-cover object-top" />
        </div>
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right,#050c1a 35%,transparent)" }} />
        <div className="absolute top-4 right-6 text-right pointer-events-none hidden md:block">
          <p className="font-extrabold italic text-white/25 text-lg leading-tight">Great<br/>Minds<br/>Build<br/>Great<br/>Things</p>
        </div>
        <div className="relative z-10">
          <p className="text-xs font-semibold tracking-widest text-[#94b8d8] uppercase mb-1">Welcome back</p>
          <h1 className="text-2xl font-extrabold text-white mb-0.5">Hello, {user.name.split(" ")[0]} 👋</h1>
          <p className="text-xs text-[#94b8d8] mb-4">Here&apos;s what&apos;s keeping you ahead.</p>
          <div className="flex gap-3">
            <Link href="/dashboard/quizzes" className="arc-btn text-xs px-5">Take a Quiz →</Link>
            <Link href="/dashboard/topics"  className="arc-btn-outline text-xs px-5">Browse Courses</Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="arc-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                style={{ background: `${s.color}15`, border: `1px solid ${s.color}25` }}>
                {s.icon}
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: "rgba(77,184,255,0.08)", color: "#94b8d8" }}>{s.sub}</span>
            </div>
            <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-[#94b8d8] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Learning Progress */}
        <div className="lg:col-span-2 arc-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span style={{ color: "#4db8ff" }}><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 10l3-4 3 2 4-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
              <h2 className="text-sm font-bold text-white">My Learning Progress</h2>
            </div>
            <Link href="/dashboard/results" className="text-xs text-[#4db8ff] hover:underline">View All →</Link>
          </div>
          {attempts.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">🚀</div>
              <p className="text-[#94b8d8] text-sm mb-4">No quizzes completed yet.</p>
              <Link href="/dashboard/quizzes" className="arc-btn text-xs">Start your first quiz</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {attempts.map((a, i) => {
                const pct = a.totalMarks > 0 ? Math.round((a.score / a.totalMarks) * 100) : 0;
                return (
                  <Link key={a.id} href={`/dashboard/results`}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm"
                      style={{ background: "rgba(77,184,255,0.1)" }}>
                      {COURSE_ICONS[i % COURSE_ICONS.length]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{a.quiz.title}</p>
                      <div className="arc-progress mt-1.5">
                        <div className="arc-progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <span className="text-xs font-extrabold shrink-0"
                      style={{ color: pct >= 70 ? "#00d4aa" : pct >= 50 ? "#f5c842" : "#ff4d6d" }}>
                      {pct}%
                    </span>
                  </Link>
                );
              })}
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
            <Link href="/dashboard/results" className="text-xs text-[#4db8ff] hover:underline">View All →</Link>
          </div>
          {attempts.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs text-[#4a7098]">No activity yet.</p>
              <Link href="/dashboard/quizzes" className="arc-btn mt-3 text-xs inline-flex">Take a quiz</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {attempts.map((a, i) => (
                <div key={a.id} className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5"
                    style={{ background: "rgba(0,212,170,0.15)", color: "#00d4aa" }}>✓</div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white leading-tight">Completed quiz</p>
                    <p className="text-[10px] text-[#4a7098] mt-0.5 truncate">{a.quiz.title}</p>
                    <p className="text-[10px] text-[#4a7098]">
                      {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Available Courses */}
        <div className="lg:col-span-2 arc-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span style={{ color: "#4db8ff" }}><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M4 5h6M4 8h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg></span>
              <h2 className="text-sm font-bold text-white">Available Courses</h2>
            </div>
            <Link href="/dashboard/topics" className="text-xs text-[#4db8ff] hover:underline">View All →</Link>
          </div>
          {allTopics.length === 0 ? (
            <p className="text-xs text-[#4a7098] text-center py-6">No courses published yet.</p>
          ) : (
            <div className="space-y-3">
              {allTopics.map((t, i) => (
                <Link key={t.id} href={`/dashboard/topics`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-base"
                    style={{ background: "rgba(77,184,255,0.1)" }}>
                    {COURSE_ICONS[i % COURSE_ICONS.length]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{t.title}</p>
                    {t.description && <p className="text-[10px] text-[#4a7098] mt-0.5 truncate">{t.description}</p>}
                  </div>
                  <span className="text-[10px] text-[#94b8d8] shrink-0">{t._count.topicProgress} views</span>
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
              { href: "/dashboard/quizzes",    icon: "📝", label: "Browse Quizzes",  sub: `${availableQuizzes} available` },
              { href: "/dashboard/topics",     icon: "📚", label: "Browse Courses",  sub: `${totalTopics} courses`        },
              { href: "/dashboard/leaderboard",icon: "🏆", label: "Leaderboard",     sub: "See rankings"                  },
              { href: "/dashboard/exams",      icon: "📋", label: "Upcoming Exams",  sub: "Scheduled"                     },
              { href: "/dashboard/results",    icon: "📊", label: "My Results",      sub: "Past attempts"                 },
              { href: "/dashboard/settings",   icon: "⚙️", label: "Settings",        sub: "Profile & security"            },
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
    </div>
  );
}
