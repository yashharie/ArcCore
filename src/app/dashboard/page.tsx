// Member Dashboard — shows progress stats and recent quiz attempts
// Auth integration point for Member 1

import { prisma } from "@/lib/db/prisma";
import Link from "next/link";

// Placeholder user for development — replace with session user from Member 1's auth
const PLACEHOLDER_USER_ID = "placeholder-user-id";
const PLACEHOLDER_USER_NAME = "Demo Member";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Member 1 will provide: const session = await getServerSession(); const userId = session.user.id;
  const userId = PLACEHOLDER_USER_ID;
  const userName = PLACEHOLDER_USER_NAME;

  // Fetch recent attempts
  const attempts = await prisma.attempt.findMany({
    where: { userId, status: "SUBMITTED" },
    include: {
      quiz: { select: { title: true, totalMarks: true } },
    },
    orderBy: { submittedAt: "desc" },
    take: 5,
  });

  const topicsViewed = await prisma.topicProgress.count({ where: { userId } });

  const totalScore = attempts.reduce((s, a) => s + a.score, 0);
  const totalMax = attempts.reduce((s, a) => s + a.totalMarks, 0);
  const averageScore =
    totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

  // Leaderboard position
  const leaderboardEntry = await prisma.leaderboard.findUnique({
    where: { userId },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back, {userName} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Here&apos;s your learning progress summary.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <StatCard
            label="Quizzes Taken"
            value={attempts.length}
            color="indigo"
          />
          <StatCard
            label="Avg. Score"
            value={`${averageScore}%`}
            color="green"
          />
          <StatCard
            label="Topics Viewed"
            value={topicsViewed}
            color="blue"
          />
          <StatCard
            label="Leaderboard Rank"
            value={leaderboardEntry?.rank ? `#${leaderboardEntry.rank}` : "—"}
            color="yellow"
          />
        </div>

        {/* Recent Attempts */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Recent Quiz Attempts
            </h2>
            <Link
              href="/leaderboard"
              className="text-indigo-600 text-sm hover:underline"
            >
              View Leaderboard →
            </Link>
          </div>

          {attempts.length === 0 ? (
            <p className="text-gray-400 text-sm py-6 text-center">
              You haven&apos;t completed any quizzes yet.{" "}
              <Link href="/quizzes" className="text-indigo-600 hover:underline">
                Browse quizzes →
              </Link>
            </p>
          ) : (
            <div className="space-y-3">
              {attempts.map((attempt) => {
                const pct =
                  attempt.totalMarks > 0
                    ? Math.round((attempt.score / attempt.totalMarks) * 100)
                    : 0;
                return (
                  <Link
                    key={attempt.id}
                    href={`/results/${attempt.id}?userId=${userId}`}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
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
                        className={`font-bold text-lg ${
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <QuickLink href="/quizzes" label="📝 Take a Quiz" />
          <QuickLink href="/topics" label="📚 Browse Topics" />
          <QuickLink href="/leaderboard" label="🏆 Leaderboard" />
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

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl border border-gray-200 p-5 text-center font-medium text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
    >
      {label}
    </Link>
  );
}
