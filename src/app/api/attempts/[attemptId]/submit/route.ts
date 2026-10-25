// POST /api/attempts/[attemptId]/submit — Submit answers and calculate score on the server

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthForApi } from "@/lib/auth/authorization";
import { evaluateAnswer, calculateTotalScore } from "@/features/results/scoring";
import type { QuestionType } from "@/features/results/scoring";

interface SubmitBody {
  answers: {
    questionId: string;
    submittedAnswer: unknown;
  }[];
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const auth = await requireAuthForApi();
  if (auth.error) return auth.error;
  const user = auth.user;

  const { attemptId } = await params;
  let body: SubmitBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { answers } = body;
  if (!answers || !Array.isArray(answers)) {
    return NextResponse.json({ error: "answers array is required." }, { status: 400 });
  }

  // Fetch attempt and verify ownership
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: {
        include: {
          questions: {
            select: {
              id: true,
              type: true,
              correctAnswer: true,
              marks: true,
            },
          },
        },
      },
    },
  });

  if (!attempt) {
    return NextResponse.json({ error: "Attempt not found." }, { status: 404 });
  }
  if (attempt.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  if (attempt.status !== "IN_PROGRESS") {
    return NextResponse.json({ error: "Attempt already submitted." }, { status: 409 });
  }

  const questionMap = new Map(
    attempt.quiz.questions.map((q) => [q.id, q])
  );

  // Evaluate each answer server-side — never trust client-submitted scores
  const evaluatedAnswers = answers.map((a) => {
    const question = questionMap.get(a.questionId);
    if (!question) {
      return {
        questionId: a.questionId,
        submittedAnswer: a.submittedAnswer,
        isCorrect: false,
        marksAwarded: 0,
      };
    }
    const { isCorrect, marksAwarded } = evaluateAnswer(
      question.type as QuestionType,
      question.correctAnswer,
      a.submittedAnswer,
      question.marks
    );
    return { questionId: a.questionId, submittedAnswer: a.submittedAnswer, isCorrect, marksAwarded };
  });

  const totalScore = calculateTotalScore(evaluatedAnswers);
  const correctAnswers = evaluatedAnswers.filter((a) => a.isCorrect).length;
  const totalQuestions = attempt.quiz.questions.length;
  const timeTaken = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000);
  const scorePercent =
    attempt.totalMarks > 0
      ? Math.round((totalScore / attempt.totalMarks) * 100 * 100) / 100
      : 0;

  // Save everything in a transaction
  const [updatedAttempt] = await prisma.$transaction([
    prisma.attempt.update({
      where: { id: attemptId },
      data: {
        status: "SUBMITTED",
        score: totalScore,
        correctAnswers,
        totalQuestions,
        submittedAt: new Date(),
        timeTaken,
      },
    }),
    prisma.attemptAnswer.createMany({
      data: evaluatedAnswers.map((ea) => ({
        attemptId,
        questionId: ea.questionId,
        submittedAnswer: ea.submittedAnswer as object,
        isCorrect: ea.isCorrect,
        marksAwarded: ea.marksAwarded,
      })),
    }),
  ]);

  // Upsert per-quiz leaderboard entry
  await prisma.quizLeaderboard.upsert({
    where: { quizId_userId: { quizId: attempt.quizId, userId: user.id } },
    create: {
      quizId: attempt.quizId,
      userId: user.id,
      correctAnswers,
      totalQuestions,
      scorePercent,
      timeTaken,
      submittedAt: new Date(),
    },
    update: {
      correctAnswers,
      totalQuestions,
      scorePercent,
      timeTaken,
      submittedAt: new Date(),
    },
  });

  // Recompute per-quiz ranks (correct desc, time asc for tie-break)
  await recomputeQuizRanks(attempt.quizId);

  // Upsert overall leaderboard — use average score % for fairness
  const allSubmitted = await prisma.attempt.findMany({
    where: { userId: user.id, status: "SUBMITTED" },
    select: { score: true, totalMarks: true },
  });
  const totalScoreSum = allSubmitted.reduce((s, a) => s + a.score, 0);
  const totalMarksSum = allSubmitted.reduce((s, a) => s + a.totalMarks, 0);
  const averageScorePercent =
    totalMarksSum > 0
      ? Math.round((totalScoreSum / totalMarksSum) * 100 * 100) / 100
      : 0;

  await prisma.leaderboard.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      totalScore: totalScoreSum,
      quizzesTaken: allSubmitted.length,
      totalCorrect: allSubmitted.reduce((s, _) => s + correctAnswers, correctAnswers),
      totalQuestions: totalMarksSum,
      averageScorePercent,
    },
    update: {
      totalScore: totalScoreSum,
      quizzesTaken: allSubmitted.length,
      averageScorePercent,
    },
  });

  return NextResponse.json({
    attempt: updatedAttempt,
    score: totalScore,
    totalMarks: attempt.totalMarks,
    correctAnswers,
    totalQuestions,
    percentage: scorePercent,
    timeTaken,
    attemptId,
  });
}

async function recomputeQuizRanks(quizId: string) {
  // Rank by correctAnswers desc, then timeTaken asc (faster = better on tie)
  const entries = await prisma.quizLeaderboard.findMany({
    where: { quizId },
    orderBy: [
      { scorePercent: "desc" },
      { timeTaken: "asc" },
    ],
  });

  let rank = 1;
  const updates = entries.map((entry, idx) => {
    if (
      idx > 0 &&
      (entry.scorePercent < entries[idx - 1].scorePercent ||
        (entry.scorePercent === entries[idx - 1].scorePercent &&
          entry.timeTaken > entries[idx - 1].timeTaken))
    ) {
      rank = idx + 1;
    }
    return prisma.quizLeaderboard.update({
      where: { id: entry.id },
      data: { rank },
    });
  });

  await Promise.all(updates);
}
