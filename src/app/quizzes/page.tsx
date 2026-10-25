import Link from "next/link";
import { requireAuth } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import QuizArchiveButton from "./QuizArchiveButton";

export const metadata: Metadata = {
  title: "Quizzes — ArcCore",
  description: "Browse, create, and take quizzes on ArcCore.",
};

export const instant = false;

export default async function QuizzesPage() {
  const user = await requireAuth();

  const where =
    user.role === "ADMIN"
      ? {}
      : {
          OR: [
            { createdById: user.id },
            {
              status: "PUBLISHED" as const,
              assignments: {
                some: {
                  OR: [{ assignedToAll: true }, { userId: user.id }],
                },
              },
            },
          ],
        };

  const quizzes = await prisma.quiz.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { questions: true } } },
  });

  const statusColors: Record<string, string> = {
    DRAFT: "bg-yellow-100 text-yellow-700",
    PUBLISHED: "bg-green-100 text-green-700",
    ARCHIVED: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav user={user} />
      <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quizzes</h1>
          <p className="mt-1 text-sm text-gray-500">
            {user.role === "ADMIN"
              ? "All quizzes across the platform."
              : "Quizzes available to you."}
          </p>
        </div>
        <Link
          href="/quizzes/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          + New Quiz
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <p className="text-gray-500 text-sm">No quizzes yet. Create your first one!</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {quizzes.map((q) => {
            const canEdit =
              (q.createdById === user.id || user.role === "ADMIN") &&
              q.status === "DRAFT";
            return (
              <li
                key={q.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{q.title}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {q._count.questions} question{q._count.questions !== 1 ? "s" : ""}
                    {q.timeLimitMinutes ? ` · ${q.timeLimitMinutes} min` : ""}
                    {q.deadline
                      ? ` · Due ${new Date(q.deadline).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                <div className="ml-4 flex shrink-0 items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      statusColors[q.status] ?? "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {q.status}
                  </span>
                  {canEdit && (
                    <Link
                      href={`/quizzes/${q.id}/edit`}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Edit
                    </Link>
                  )}
                  {q.status === "PUBLISHED" && (
                    <Link
                      href={`/quizzes/${q.id}/take`}
                      className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                    >
                      Take
                    </Link>
                  )}
                  {q.status === "PUBLISHED" && (
                    <Link
                      href={`/quizzes/${q.id}/leaderboard`}
                      className="rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      🏆
                    </Link>
                  )}
                  {q.status === "PUBLISHED" &&
                    (q.createdById === user.id || user.role === "ADMIN") && (
                      <QuizArchiveButton quizId={q.id} />
                    )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
    </div>
  );
}
