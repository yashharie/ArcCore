// Results & Answer Review Page
// Shows score, correct/incorrect answers with explanations

import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

interface PageProps {
  params: Promise<{ attemptId: string }>;
  searchParams: Promise<{ userId?: string }>;
}

export default async function ResultPage({ params, searchParams }: PageProps) {
  const { attemptId } = await params;
  const { userId } = await searchParams;

  // Placeholder userId for development — Member 1 will integrate auth
  const currentUserId = userId ?? "placeholder-user-id";

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: {
        select: {
          id: true,
          title: true,
          description: true,
          totalMarks: true,
        },
      },
      attemptAnswers: {
        include: {
          question: {
            select: {
              id: true,
              questionText: true,
              type: true,
              options: true,
              correctAnswer: true,
              marks: true,
              explanation: true,
              orderIndex: true,
            },
          },
        },
        orderBy: { question: { orderIndex: "asc" } },
      },
      user: { select: { id: true, name: true } },
    },
  });

  if (!attempt) notFound();

  // Only the owner can view
  if (attempt.userId !== currentUserId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 font-semibold">
          You do not have permission to view this result.
        </p>
      </div>
    );
  }

  const percentage =
    attempt.totalMarks > 0
      ? Math.round((attempt.score / attempt.totalMarks) * 100)
      : 0;

  const passed = percentage >= 50;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow p-8 mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            {attempt.quiz.title}
          </h1>
          <p className="text-gray-500 text-sm mb-6">Quiz Results</p>

          <div
            className={`inline-flex items-center justify-center w-32 h-32 rounded-full text-3xl font-bold border-8 ${
              passed
                ? "border-green-400 text-green-600 bg-green-50"
                : "border-red-400 text-red-500 bg-red-50"
            }`}
          >
            {percentage}%
          </div>

          <p className="mt-4 text-xl font-semibold text-gray-700">
            {attempt.score} / {attempt.totalMarks} marks
          </p>

          <p
            className={`mt-2 text-lg font-medium ${
              passed ? "text-green-600" : "text-red-500"
            }`}
          >
            {passed ? "🎉 Well done!" : "Keep practising!"}
          </p>

          {attempt.timeTaken !== null && (
            <p className="mt-2 text-sm text-gray-400">
              Time taken: {Math.floor(attempt.timeTaken / 60)}m{" "}
              {attempt.timeTaken % 60}s
            </p>
          )}
        </div>

        {/* Answer Review */}
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Answer Review
        </h2>

        <div className="space-y-5">
          {attempt.attemptAnswers.map((aa, index) => (
            <div
              key={aa.id}
              className={`bg-white rounded-xl shadow p-6 border-l-4 ${
                aa.isCorrect ? "border-green-400" : "border-red-400"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <p className="font-medium text-gray-800">
                  <span className="text-gray-400 mr-2">{index + 1}.</span>
                  {aa.question.questionText}
                </p>
                <span
                  className={`shrink-0 text-xs font-bold px-2 py-1 rounded-full ${
                    aa.isCorrect
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {aa.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                </span>
              </div>

              <div className="mt-3 text-sm space-y-1">
                <p className="text-gray-500">
                  <span className="font-medium">Your answer:</span>{" "}
                  <span
                    className={
                      aa.isCorrect ? "text-green-600" : "text-red-500"
                    }
                  >
                    {JSON.stringify(aa.submittedAnswer)}
                  </span>
                </p>
                {!aa.isCorrect && (
                  <p className="text-gray-500">
                    <span className="font-medium">Correct answer:</span>{" "}
                    <span className="text-green-600">
                      {JSON.stringify(aa.question.correctAnswer)}
                    </span>
                  </p>
                )}
                <p className="text-gray-500">
                  <span className="font-medium">Marks:</span>{" "}
                  {aa.marksAwarded} / {aa.question.marks}
                </p>
              </div>

              {aa.question.explanation && (
                <div className="mt-3 bg-blue-50 rounded-lg px-4 py-3 text-sm text-blue-700">
                  <span className="font-medium">Explanation: </span>
                  {aa.question.explanation}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-8 justify-center">
          <Link
            href="/dashboard"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/leaderboard"
            className="bg-white text-indigo-600 border border-indigo-300 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
          >
            View Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}
