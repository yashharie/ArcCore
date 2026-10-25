// Results History Page — shows all past quiz attempts for a user

import { prisma } from "@/lib/db/prisma";
import Link from "next/link";

// Placeholder — Member 1 will replace with session auth
const PLACEHOLDER_USER_ID = "placeholder-user-id";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const userId = PLACEHOLDER_USER_ID;

  const attempts = await prisma.attempt.findMany({
    where: { userId },
    include: {
      quiz: { select: { id: true, title: true, totalMarks: true } },
    },
    orderBy: { startedAt: "desc" },
  });

  const statusLabel: Record<string, string> = {
    IN_PROGRESS: "In Progress",
    SUBMITTED: "Completed",
    TIMED_OUT: "Timed Out",
  };

  const statusColor: Record<string, string> = {
    IN_PROGRESS: "bg-yellow-100 text-yellow-700",
    SUBMITTED: "bg-green-100 text-green-700",
    TIMED_OUT: "bg-red-100 text-red-600",
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quiz History</h1>
          <p className="text-gray-500 mt-1">All your past quiz attempts.</p>
        </div>

        {attempts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center text-gray-400">
            No quiz attempts yet.{" "}
            <Link href="/quizzes" className="text-indigo-600 hover:underline">
              Take a quiz →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {attempts.map((attempt) => {
              const pct =
                attempt.status === "SUBMITTED" && attempt.totalMarks > 0
                  ? Math.round((attempt.score / attempt.totalMarks) * 100)
                  : null;

              return (
                <div
                  key={attempt.id}
                  className="bg-white rounded-xl shadow p-5 flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {attempt.quiz.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(attempt.startedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        statusColor[attempt.status]
                      }`}
                    >
                      {statusLabel[attempt.status]}
                    </span>

                    {pct !== null && (
                      <span
                        className={`text-sm font-bold ${
                          pct >= 50 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {pct}%
                      </span>
                    )}

                    {attempt.status === "SUBMITTED" && (
                      <Link
                        href={`/results/${attempt.id}?userId=${userId}`}
                        className="text-indigo-600 text-sm hover:underline font-medium"
                      >
                        Review →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="text-indigo-600 hover:underline text-sm font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
