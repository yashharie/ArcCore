import { requireAuth } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Quiz Results — ArcCore" };
export const instant = false;

interface PageProps { params: Promise<{ attemptId: string }> }

function formatAnswer(type: string, answer: unknown, options: unknown): string {
  if (answer === null || answer === undefined) return "No answer";
  const ans = answer as Record<string, unknown>;
  const opts = options as { id: string; text: string }[] | { left: { id: string; text: string }[]; right: { id: string; text: string }[] } | null;
  switch (type) {
    case "MCQ": case "DROPDOWN": {
      const list = opts as { id: string; text: string }[] | null;
      return list?.find((o) => o.id === ans.optionId)?.text ?? String(ans.optionId ?? "—");
    }
    case "TRUE_FALSE": return ans.value === true ? "True" : ans.value === false ? "False" : "—";
    case "FILL_BLANK": {
      const blanks = ans.blanks as string[] | undefined;
      return blanks ? blanks.map((b, i) => `Blank ${i + 1}: "${b}"`).join(", ") : "—";
    }
    case "MATCHING": {
      const pairs = ans.pairs as { left: string; right: string }[] | undefined;
      if (!pairs) return "—";
      const mo = opts as { left: { id: string; text: string }[]; right: { id: string; text: string }[] } | null;
      return pairs.map((p) => {
        const l = mo?.left?.find((x) => x.id === p.left)?.text ?? p.left;
        const r = mo?.right?.find((x) => x.id === p.right)?.text ?? p.right;
        return `${l} → ${r}`;
      }).join(", ");
    }
    default: return JSON.stringify(answer);
  }
}

export default async function ResultPage({ params }: PageProps) {
  const user = await requireAuth();
  const { attemptId } = await params;

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: { select: { id: true, title: true, description: true } },
      attemptAnswers: {
        include: {
          question: {
            select: { id: true, text: true, type: true, options: true, correctAnswer: true, marks: true, explanation: true, order: true },
          },
        },
        orderBy: { question: { order: "asc" } },
      },
      user: { select: { id: true, name: true } },
    },
  });

  if (!attempt) notFound();
  if (attempt.userId !== user.id && user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#050c1a" }}>
        <div className="arc-card p-10 text-center max-w-sm">
          <div className="text-4xl mb-3">🔒</div>
          <p className="text-white font-semibold mb-4">You don't have permission to view this result.</p>
          <Link href="/dashboard" className="arc-btn text-xs">← Dashboard</Link>
        </div>
      </div>
    );
  }

  const percentage = attempt.totalMarks > 0
    ? Math.round((attempt.score / attempt.totalMarks) * 100) : 0;
  const passed = percentage >= 50;
  const correct = attempt.attemptAnswers.filter((a) => a.isCorrect).length;
  const total = attempt.attemptAnswers.length;

  return (
    <div className="min-h-screen" style={{ background: "#050c1a" }}>
      <Nav user={user} />
      <div className="max-w-3xl mx-auto px-5 pt-20 pb-12">

        {/* Score card */}
        <div className="arc-card p-8 mb-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <img src="/city-hero.png" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom,transparent,#0a1628)" }} />

          <div className="relative z-10">
            <h1 className="text-lg font-bold text-white mb-1">{attempt.quiz.title}</h1>
            <p className="text-xs text-[#94b8d8] mb-6">Quiz Results</p>

            {/* Circular score */}
            <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(30,58,110,0.4)" strokeWidth="8" />
                <circle cx="64" cy="64" r="56" fill="none"
                  stroke={passed ? "#00d4aa" : "#ff4d6d"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - percentage / 100)}`}
                  style={{ transition: "stroke-dashoffset 1s ease" }}
                />
              </svg>
              <div className="text-center">
                <p className="text-3xl font-extrabold" style={{ color: passed ? "#00d4aa" : "#ff4d6d" }}>{percentage}%</p>
                <p className="text-xs text-[#94b8d8]">{attempt.score}/{attempt.totalMarks}</p>
              </div>
            </div>

            <p className="text-lg font-bold mb-2" style={{ color: passed ? "#00d4aa" : "#ff4d6d" }}>
              {passed ? "🎉 Well done!" : "Keep practising!"}
            </p>

            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="text-center">
                <p className="font-bold text-white">{correct}/{total}</p>
                <p className="text-xs text-[#94b8d8]">Correct</p>
              </div>
              {attempt.timeTaken !== null && (
                <div className="text-center">
                  <p className="font-bold text-white">{Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s</p>
                  <p className="text-xs text-[#94b8d8]">Time taken</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Answer review */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white">Answer Review</h2>
          <span className="text-xs text-[#94b8d8]">{correct}/{total} correct</span>
        </div>

        <div className="space-y-3">
          {attempt.attemptAnswers.map((aa, index) => (
            <div key={aa.id} className="arc-card p-5"
              style={{ borderLeft: `3px solid ${aa.isCorrect ? "#00d4aa" : "#ff4d6d"}` }}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <p className="text-sm font-medium text-white">
                  <span className="text-[#4a7098] mr-2">{index + 1}.</span>
                  {aa.question.text}
                </p>
                <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: aa.isCorrect ? "rgba(0,212,170,0.12)" : "rgba(255,77,109,0.12)",
                    color: aa.isCorrect ? "#00d4aa" : "#ff4d6d",
                  }}>
                  {aa.isCorrect ? "✓ Correct" : "✗ Wrong"}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex gap-2">
                  <span className="text-[#94b8d8] shrink-0">Your answer:</span>
                  <span style={{ color: aa.isCorrect ? "#00d4aa" : "#ff4d6d" }}>
                    {formatAnswer(aa.question.type, aa.submittedAnswer, aa.question.options)}
                  </span>
                </div>
                {!aa.isCorrect && (
                  <div className="flex gap-2">
                    <span className="text-[#94b8d8] shrink-0">Correct answer:</span>
                    <span style={{ color: "#00d4aa" }}>
                      {formatAnswer(aa.question.type, aa.question.correctAnswer, aa.question.options)}
                    </span>
                  </div>
                )}
                <div className="flex gap-2">
                  <span className="text-[#94b8d8] shrink-0">Marks:</span>
                  <span className="text-white">{aa.marksAwarded}/{aa.question.marks}</span>
                </div>
              </div>

              {aa.question.explanation && (
                <div className="mt-3 p-3 rounded-xl text-xs"
                  style={{ background: "rgba(77,184,255,0.06)", border: "1px solid rgba(77,184,255,0.15)", color: "#94b8d8" }}>
                  <span className="text-[#4db8ff] font-semibold">💡 Explanation: </span>
                  {aa.question.explanation}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-8 justify-center flex-wrap">
          <Link href="/dashboard" className="arc-btn text-xs px-6">← Dashboard</Link>
          <Link href={`/quizzes/${attempt.quiz.id}/leaderboard`} className="arc-btn-outline text-xs px-6">Quiz Leaderboard</Link>
          <Link href="/leaderboard" className="arc-btn-outline text-xs px-6">Overall Leaderboard</Link>
        </div>
      </div>
    </div>
  );
}
