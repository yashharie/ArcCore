// Exams page — list all upcoming and past exams

import { requireAuth } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exams — ArcCore",
  description: "Group exams scheduled by admins.",
};

export const instant = false;

export default async function ExamsPage() {
  const user = await requireAuth();

  const where =
    user.role === "ADMIN"
      ? {}
      : { status: { in: (["SCHEDULED", "ONGOING", "COMPLETED"] as string[]) as ("SCHEDULED" | "ONGOING" | "COMPLETED")[] } };

  const exams = await prisma.exam.findMany({
    where,
    orderBy: { scheduledAt: "asc" },
    include: {
      createdBy: { select: { name: true } },
      examQuizzes: {
        include: {
          quiz: { select: { id: true, title: true, _count: { select: { questions: true } } } },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  const statusColors: Record<string, string> = {
    SCHEDULED: "bg-blue-100 text-blue-700",
    ONGOING: "bg-green-100 text-green-700",
    COMPLETED: "bg-gray-100 text-gray-600",
    CANCELLED: "bg-red-100 text-red-600",
  };

  const now = new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav user={user} />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📋 Exams</h1>
            <p className="mt-1 text-sm text-gray-500">
              {user.role === "ADMIN"
                ? "All scheduled and past group exams."
                : "Upcoming and past group exams."}
            </p>
          </div>
          {user.role === "ADMIN" && (
            <Link
              href="/exams/new"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              + New Exam
            </Link>
          )}
        </div>

        {exams.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-16 text-center">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-gray-500 text-sm">No exams scheduled yet.</p>
            {user.role === "ADMIN" && (
              <Link
                href="/exams/new"
                className="mt-4 inline-block text-sm text-indigo-600 hover:underline"
              >
                Schedule an exam →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {exams.map((exam) => {
              const isPast = new Date(exam.scheduledAt) < now;
              return (
                <div
                  key={exam.id}
                  className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            statusColors[exam.status] ?? "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {exam.status}
                        </span>
                        {isPast && exam.status === "SCHEDULED" && (
                          <span className="text-xs text-orange-500 font-medium">
                            Overdue
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {exam.title}
                      </h2>
                      {exam.description && (
                        <p className="text-sm text-gray-500 mt-1">{exam.description}</p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-400">
                        <span>
                          📅{" "}
                          {new Date(exam.scheduledAt).toLocaleDateString(undefined, {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span>⏱️ {exam.duration} minutes</span>
                        <span>📊 {exam.totalMarks} marks</span>
                        <span>By {exam.createdBy.name}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <Link
                        href={`/exams/${exam.id}`}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors text-center"
                      >
                        Details
                      </Link>
                      {user.role === "ADMIN" && (
                        <Link
                          href={`/exams/${exam.id}/edit`}
                          className="rounded-lg border border-indigo-200 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors text-center"
                        >
                          Manage
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Quizzes in exam */}
                  {exam.examQuizzes.length > 0 && (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <p className="text-xs font-medium text-gray-500 mb-2">
                        {exam.examQuizzes.length} Quiz
                        {exam.examQuizzes.length !== 1 ? "zes" : ""} in this exam:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {exam.examQuizzes.map((eq) => (
                          <span
                            key={eq.id}
                            className="rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs text-indigo-700"
                          >
                            {eq.quiz.title} ({eq.quiz._count.questions} Qs)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
