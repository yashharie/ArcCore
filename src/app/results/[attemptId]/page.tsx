import { requireAuth } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiz Results — ArcCore",
  description: "View your quiz results and answer review.",
};

interface PageProps {
  params: Promise<{ attemptId: string }>;
}

export const instant = false;

// Human-readable rendering of answers and correct answers by question type
function formatAnswer(
  type: string,
  answer: unknown,
  options: unknown
): string {
  if (answer === null || answer === undefined) return "No answer";

  const ans = answer as Record<string, unknown>;
  const opts = options as
    | { id: string; text: string }[]
    | { left: { id: string; text: string }[]; right: { id: string; text: string }[] }
    | { caseSensitive?: boolean }
    | null;

  switch (type) {
    case "MCQ":
    case "DROPDOWN": {
      const optList = opts as { id: string; text: string }[] | null;
      const matched = optList?.find((o) => o.id === ans.optionId);
      return matched ? matched.text : String(ans.optionId ?? "—");
    }
    case "TRUE_FALSE":
      return ans.value === true ? "True" : ans.value === false ? "False" : "—";
    case "FILL_BLANK": {
      const blanks = ans.blanks as string[] | undefined;
      if (!blanks) return "—";
      return blanks.map((b, i) => `Blank ${i + 1}: "${b}"`).join(", ");
    }
    case "MATCHING": {
      const pairs = ans.pairs as { left: string; right: string }[] | undefined;
      if (!pairs) return "—";
      const matchOpts = opts as { left: { id: string; text: string }[]; right: { id: string; text: string }[] } | null;
      return pairs
        .map((p) => {
          const leftText = matchOpts?.left?.find((l) => l.id === p.left)?.text ?? p.left;
          const rightText = matchOpts?.right?.find((r) => r.id === p.right)?.text ?? p.right;
          return `${leftText} → ${rightText}`;
        })
        .join(", ");
    }
    default:
      return JSON.stringify(answer);
  }
}

export default async function ResultPage({ params }: PageProps) {
  const user = await requireAuth();
  const { attemptId } = await params;

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: {
        select: {
          id: true,
          title: true,
          description: true,
        },
      },
      attemptAnswers: {
        include: {
          question: {
            select: {
              id: true,
              text: true,
              type: true,
              options: true,
              correctAnswer: true,
              marks: true,
              explanation: true,
              order: true,
            },
          },
        },
        orderBy: { question: { order: "asc" } },
      },
      user: { select: { id: true, name: true } },
    },
  });

  if (!attempt) notFound();

  // Only the owner or admin can view
  if (attempt.userId !== user.id && user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">
            You do not have permission to view this result.
          </p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const percentage =
    attempt.totalMarks > 0
      ? Math.round((attempt.score / attempt.totalMarks) * 100)
      : 0;

  const passed = percentage >= 50;

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav user={user} />
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Score Card */}
        <div className="bg-white rounded-2xl shadow p-8 mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {attempt.quiz.title}
          </h1>
          <p className="text-gray-400 text-sm mb-6">Quiz Results</p>

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
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Answer Review</h2>

        <div className="space-y-4">
          {attempt.attemptAnswers.map((aa, index) => (
            <div
              key={aa.id}
              className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${
                aa.isCorrect ? "border-green-400" : "border-red-400"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <p className="font-medium text-gray-900">
                  <span className="text-gray-400 mr-2">{index + 1}.</span>
                  {aa.question.text}
                </p>
                <span
                  className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
                    aa.isCorrect
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {aa.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                </span>
              </div>

              <div className="mt-3 text-sm space-y-1.5">
                <p className="text-gray-500">
                  <span className="font-medium">Your answer:</span>{" "}
                  <span className={aa.isCorrect ? "text-green-600" : "text-red-500"}>
                    {formatAnswer(aa.question.type, aa.submittedAnswer, aa.question.options)}
                  </span>
                </p>
                {!aa.isCorrect && (
                  <p className="text-gray-500">
                    <span className="font-medium">Correct answer:</span>{" "}
                    <span className="text-green-600">
                      {formatAnswer(aa.question.type, aa.question.correctAnswer, aa.question.options)}
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
        <div className="flex gap-4 mt-8 justify-center flex-wrap">
          <Link
            href="/dashboard"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Back to Dashboard
          </Link>
          <Link
            href={`/quizzes/${attempt.quiz.id}/leaderboard`}
            className="bg-white text-indigo-600 border border-indigo-300 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
          >
            Quiz Leaderboard
          </Link>
          <Link
            href="/leaderboard"
            className="bg-white text-gray-600 border border-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Overall Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}
