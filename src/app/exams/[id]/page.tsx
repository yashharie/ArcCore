// Exam Detail Page — view exam info and its quizzes

import { requireAuth } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Link from "next/link";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const instant = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const exam = await prisma.exam.findUnique({ where: { id }, select: { title: true } });
  return { title: exam ? `${exam.title} — ArcCore` : "Exam — ArcCore" };
}

export default async function ExamPage({ params }: PageProps) {
  const user = await requireAuth();
  const { id } = await params;

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      createdBy: { select: { name: true } },
      examQuizzes: {
        include: {
          quiz: {
            select: {
              id: true,
              title: true,
              description: true,
              timeLimitMinutes: true,
              status: true,
              _count: { select: { questions: true } },
            },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!exam) notFound();
  if (user.role !== "ADMIN" && exam.status === "CANCELLED") notFound();

  const statusColors: Record<string, string> = {
    SCHEDULED: "bg-blue-100 text-blue-700",
    ONGOING: "bg-green-100 text-green-700",
    COMPLETED: "bg-gray-100 text-gray-600",
    CANCELLED: "bg-red-100 text-red-600",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav user={user} />

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/exams" className="text-indigo-600 hover:underline">
            Exams
          </Link>
          <span>/</span>
          <span className="truncate">{exam.title}</span>
        </div>

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    statusColors[exam.status]
                  }`}
                >
                  {exam.status}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
              {exam.description && (
                <p className="mt-2 text-gray-500">{exam.description}</p>
              )}
            </div>
            {user.role === "ADMIN" && (
              <Link
                href={`/exams/${exam.id}/edit`}
                className="shrink-0 rounded-lg border border-indigo-200 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                Manage
              </Link>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <InfoCard
              label="Scheduled"
              value={new Date(exam.scheduledAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            />
            <InfoCard label="Time" value={new Date(exam.scheduledAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })} />
            <InfoCard label="Duration" value={`${exam.duration} min`} />
            <InfoCard label="Total Marks" value={String(exam.totalMarks)} />
          </div>

          <p className="mt-4 text-xs text-gray-400">Created by {exam.createdBy.name}</p>
        </div>

        {/* Quizzes */}
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          Quizzes ({exam.examQuizzes.length})
        </h2>

        {exam.examQuizzes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-gray-400 text-sm">
            No quizzes added to this exam yet.
            {user.role === "ADMIN" && (
              <Link
                href={`/exams/${exam.id}/edit`}
                className="block mt-2 text-indigo-600 hover:underline"
              >
                Add quizzes →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {exam.examQuizzes.map((eq, idx) => (
              <div
                key={eq.id}
                className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4"
              >
                <span className="text-sm font-bold text-gray-300 w-6 text-center">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{eq.quiz.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {eq.quiz._count.questions} questions
                    {eq.quiz.timeLimitMinutes
                      ? ` · ${eq.quiz.timeLimitMinutes} min`
                      : ""}
                  </p>
                </div>
                {eq.quiz.status === "PUBLISHED" && (
                  <Link
                    href={`/quizzes/${eq.quiz.id}/take`}
                    className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                  >
                    Take
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/exams" className="text-sm text-indigo-600 hover:underline">
            ← Back to Exams
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 px-4 py-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
    </div>
  );
}
