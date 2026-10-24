// POST /api/attempts/[attemptId]/submit — Submit answers and calculate score on the server

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { evaluateAnswer, calculateTotalScore } from "@/features/results/scoring";
import type { QuestionType } from "@/features/results/scoring";

interface SubmitBody {
  userId: string;
  answers: {
    questionId: string;
    submittedAnswer: unknown;
  }[];
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const body = (await request.json()) as SubmitBody;
    const { userId, answers } = body;

    if (!userId || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "userId and answers array are required" },
        { status: 400 }
      );
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
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Only the owner can submit
    if (attempt.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Already submitted?
    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Attempt already submitted" },
        { status: 409 }
      );
    }

    // Build a question map for quick lookup
    const questionMap = new Map(
      attempt.quiz.questions.map((q) => [q.id, q])
    );

    // Evaluate each answer on the server — never trust client-submitted scores
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

      return {
        questionId: a.questionId,
        submittedAnswer: a.submittedAnswer,
        isCorrect,
        marksAwarded,
      };
    });

    const totalScore = calculateTotalScore(evaluatedAnswers);
    const timeTaken = Math.floor(
      (Date.now() - attempt.startedAt.getTime()) / 1000
    );

    // Save everything in a transaction
    const [updatedAttempt] = await prisma.$transaction([
      prisma.attempt.update({
        where: { id: attemptId },
        data: {
          status: "SUBMITTED",
          score: totalScore,
          submittedAt: new Date(),
          timeTaken,
        },
      }),
      prisma.attemptAnswer.createMany({
        data: evaluatedAnswers.map((ea) => ({
          attemptId,
          questionId: ea.questionId,
          submittedAnswer: ea.submittedAnswer,
          isCorrect: ea.isCorrect,
          marksAwarded: ea.marksAwarded,
        })),
      }),
    ]);

    // Update leaderboard (upsert)
    await prisma.leaderboard.upsert({
      where: { userId },
      create: {
        userId,
        totalScore,
        quizzesTaken: 1,
      },
      update: {
        totalScore: { increment: totalScore },
        quizzesTaken: { increment: 1 },
      },
    });

    return NextResponse.json({
      attempt: updatedAttempt,
      score: totalScore,
      totalMarks: attempt.totalMarks,
      percentage:
        attempt.totalMarks > 0
          ? Math.round((totalScore / attempt.totalMarks) * 100)
          : 0,
    });
  } catch (error) {
    console.error("[POST /api/attempts/[attemptId]/submit]", error);
    return NextResponse.json(
      { error: "Failed to submit attempt" },
      { status: 500 }
    );
  }
}
