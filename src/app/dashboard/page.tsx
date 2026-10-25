import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard — ArcCore",
  description: "Your ArcCore learning dashboard.",
};

// Reads cookies (session) — opt out of static prerendering
export const instant = false;

export default async function DashboardPage() {
  const user = await requireAuth();

  // Fetch recent submitted attempts
  const attempts = await prisma.attempt.findMany({
    where: { userId: user.id, status: "SUBMITTED" },
    include: {
      quiz: { select: { title: true } },
    },
    orderBy: { submittedAt: "desc" },
    take: 5,
  });

  const topicsViewed = await prisma.topicProgress.count({
    where: { userId: user.id },
  });

  const totalScore = attempts.reduce((s, a) => s + a.score, 0);
  const totalMax = attempts.reduce((s, a) => s + a.totalMarks, 0);
  const averageScore =
    totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

  const leaderboardEntry = await prisma.leaderboard.findUnique({
    where: { userId: user.id },
  });

  // Count available published quizzes
  const availableQuizzes = await prisma.quiz.count({
    where: {
      status: "PUBLISHED",
      assignments: {
        some: {
          OR: [{ assignedToAll: true }, { userId: user.id }],
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <Nav user={user} />

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name} 👋
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Here&apos;s your learning progress summary.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <StatCard label="Quizzes Taken" value={attempts.length} color="indigo" />
          <StatCard label="Avg. Score" value={`${averageScore}%`} color="green" />
          <StatCard label="Topics Viewed" value={topicsViewed} color="blue" />
          <StatCard
            label="Leaderboard Rank"
            value={leaderboardEntry?.rank ? `#${leaderboardEntry.rank}` : "—"}
            color="yellow"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Attempts */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">
                Recent Quiz Attempts
              </h2>
              <Link
                href="/results"
                className="text-indigo-600 text-xs hover:underline"
              >
                View all →
              </Link>
            </div>

            {attempts.length === 0 ? (
              <p className="text-gray-400 text-sm py-6 text-center">
                No completed quizzes yet.{" "}
                <Link href="/quizzes" className="text-indigo-600 hover:underline">
                  Take one →
                </Link>
              </p>
            ) : (
              <div className="space-y-2">
                {attempts.map((attempt) => {
                  const pct =
                    attempt.totalMarks > 0
                      ? Math.round((attempt.score / attempt.totalMarks) * 100)
                      : 0;
                  return (
                    <Link
                      key={attempt.id}
                      href={`/results/${attempt.id}`}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {attempt.quiz.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {attempt.submittedAt
                            ? new Date(attempt.submittedAt).toLocaleDateString()
                            : "—"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold text-base ${
                            pct >= 50 ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {pct}%
                        </p>
                        <p className="text-xs text-gray-400">
                          {attempt.score}/{attempt.totalMarks}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-gray-900">Quick Links</h2>
            <QuickLink href="/quizzes" label="📝 Quizzes" sub={`${availableQuizzes} available`} />
            <QuickLink href="/topics" label="📚 Topics" sub="Browse materials" />
            <QuickLink href="/exams" label="📋 Exams" sub="Group assessments" />
            <QuickLink href="/leaderboard" label="🏆 Leaderboard" sub="See rankings" />
            <QuickLink href="/results" label="📊 My History" sub="Past attempts" />
            <QuickLink href="/profile" label="👤 Profile" sub="Manage account" />
            {user.role === "ADMIN" && (
              <QuickLink href="/admin" label="🛡️ Admin" sub="Manage platform" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: "indigo" | "green" | "blue" | "yellow";
}) {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-700",
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
    yellow: "bg-yellow-50 text-yellow-700",
  };
  return (
    <div className={`rounded-xl p-5 ${colorMap[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-1 opacity-75">{label}</p>
    </div>
  );
}

function QuickLink({ href, label, sub }: { href: string; label: string; sub: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
    >
      <span className="text-sm font-medium text-gray-800">{label}</span>
      <span className="text-xs text-gray-400">{sub}</span>
    </Link>
  );
}
