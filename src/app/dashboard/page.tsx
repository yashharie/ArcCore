import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";
import Link from "next/link";

export const metadata: Metadata = { title: "Dashboard — ArcCore" };
export const instant = false;

export default async function DashboardPage() {
  const user = await requireAuth();

  const [attempts, topicsViewed, leaderboardEntry, availableQuizzes, totalUsers, totalTopics] =
    await Promise.all([
      prisma.attempt.findMany({
        where: { userId: user.id, status: "SUBMITTED" },
        include: { quiz: { select: { title: true } } },
        orderBy: { submittedAt: "desc" },
        take: 5,
      }),
      prisma.topicProgress.count({ where: { userId: user.id } }),
      prisma.leaderboard.findUnique({ where: { userId: user.id } }),
      prisma.quiz.count({ where: { status: "PUBLISHED" } }),
      prisma.user.count(),
      prisma.topic.count({ where: { published: true } }),
    ]);

  const totalScore = attempts.reduce((s, a) => s + a.score, 0);
  const totalMax = attempts.reduce((s, a) => s + a.totalMarks, 0);
  const avgScore = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

  const recentActivity = [
    ...attempts.slice(0, 3).map((a) => ({
      type: "quiz",
      label: `Completed ${a.quiz.title}`,
      sub: a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : "",
      color: "#4db8ff",
    })),
  ];

  return (
    <div className="min-h-screen" style={{ background: "#050c1a" }}>
      <Nav user={user} />

      <div className="max-w-7xl mx-auto px-5 pt-20 pb-12">

        {/* Hero greeting */}
        <div className="relative rounded-2xl overflow-hidden mb-8 p-8"
          style={{ background: "linear-gradient(135deg,#0a1628 0%,#0d2040 50%,#0a1628 100%)", border: "1px solid rgba(30,58,110,0.4)" }}>
          {/* bg image */}
          <div className="absolute inset-0 opacity-20">
            <img src="/city-hero.png" alt="" className="w-full h-full object-cover object-top" />
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right,#050c1a 40%,transparent)" }} />

          <div className="relative z-10">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#94b8d8] uppercase mb-1">
              Welcome back
            </p>
            <h1 className="text-3xl font-extrabold text-white mb-1">
              Hello, {user.name.split(" ")[0]} 👋
            </h1>
            <p className="text-[#94b8d8] text-sm mb-5">
              Keep going! You&apos;re doing great.
            </p>

            {/* XP bar */}
            <div className="max-w-xs">
              <div className="flex justify-between text-xs text-[#94b8d8] mb-1">
                <span>Level {Math.floor(attempts.length / 3) + 1}</span>
                <span>{attempts.length * 100} / {(Math.floor(attempts.length / 3) + 2) * 300} XP</span>
              </div>
              <div className="arc-progress">
                <div className="arc-progress-fill" style={{ width: `${Math.min((attempts.length % 3) * 33, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon="📝" label="Courses Enrolled" value={String(topicsViewed)} color="#4db8ff" />
          <StatCard icon="🎯" label="Quizzes Taken" value={String(attempts.length)} color="#f5c842" />
          <StatCard icon="⭐" label="Total Points" value={String(totalScore)} color="#4db8ff" />
          <StatCard icon="🏆" label="Global Rank" value={leaderboardEntry?.rank ? `#${leaderboardEntry.rank}` : "—"} color="#f5c842" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* My Learning Progress */}
          <div className="lg:col-span-2 arc-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-white">My Learning Progress</h2>
              <Link href="/quizzes" className="text-xs text-[#4db8ff] hover:underline">View all</Link>
            </div>

            {attempts.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">🚀</div>
                <p className="text-[#94b8d8] text-sm">No quizzes yet.</p>
                <Link href="/quizzes" className="arc-btn mt-4 text-xs">Start a Quiz</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {attempts.map((a) => {
                  const pct = a.totalMarks > 0 ? Math.round((a.score / a.totalMarks) * 100) : 0;
                  return (
                    <Link key={a.id} href={`/results/${a.id}`}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm"
                        style={{ background: "rgba(77,184,255,0.15)" }}>
                        📝
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{a.quiz.title}</p>
                        <div className="arc-progress mt-1.5">
                          <div className="arc-progress-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <span className="text-xs font-bold shrink-0" style={{ color: pct >= 50 ? "#00d4aa" : "#ff4d6d" }}>
                        {pct}%
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-5">

            {/* Quick Nav */}
            <div className="arc-card p-5">
              <h2 className="text-sm font-bold text-white mb-4">Quick Access</h2>
              <div className="space-y-2">
                {[
                  { href: "/quizzes", icon: "📝", label: "Quizzes", sub: `${availableQuizzes} available` },
                  { href: "/topics", icon: "📚", label: "Topics", sub: `${totalTopics} published` },
                  { href: "/leaderboard", icon: "🏆", label: "Leaderboard", sub: "See rankings" },
                  { href: "/results", icon: "📊", label: "My Results", sub: "Past attempts" },
                  { href: "/exams", icon: "📋", label: "Exams", sub: "Scheduled" },
                  ...(user.role === "ADMIN" ? [{ href: "/admin", icon: "🛡️", label: "Admin", sub: `${totalUsers} members` }] : []),
                ].map((item) => (
                  <Link key={item.href} href={item.href}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group">
                    <span className="text-lg">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white group-hover:text-[#4db8ff] transition-colors">{item.label}</p>
                      <p className="text-xs text-[#4a7098]">{item.sub}</p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#4a7098] group-hover:text-[#4db8ff] transition-colors">
                      <path d="M4 7h6M7 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            {recentActivity.length > 0 && (
              <div className="arc-card p-5">
                <h2 className="text-sm font-bold text-white mb-4">Recent Activity</h2>
                <div className="space-y-3">
                  {recentActivity.map((a, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: a.color }} />
                      <div>
                        <p className="text-xs text-white">{a.label}</p>
                        <p className="text-xs text-[#4a7098]">{a.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div className="arc-card p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-[#94b8d8] mb-0.5">{label}</p>
        <p className="text-xl font-extrabold" style={{ color }}>{value}</p>
      </div>
    </div>
  );
}
