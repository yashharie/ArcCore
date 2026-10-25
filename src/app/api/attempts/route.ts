// POST /api/attempts — Start a new quiz attempt
// GET  /api/attempts — Get all attempts for the current user

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// ──────────────────────────────────────────────────────────
// GET — fetch all attempts for a user
// Query: ?userId=<id>
// ──────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const attempts = await prisma.attempt.findMany({
      where: { userId },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
            timeLimit: true,
            totalMarks: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
    });

    return NextResponse.json({ attempts });
  } catch (error) {
    console.error("[GET /api/attempts]", error);
    return NextResponse.json(
      { error: "Failed to fetch attempts" },
      { status: 500 }
    );
  }
}

// ──────────────────────────────────────────────────────────
// POST — start a new attempt
// Body: { quizId: string, userId: string }
// ──────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quizId, userId } = body as { quizId: string; userId: string };

    if (!quizId || !userId) {
      return NextResponse.json(
        { error: "quizId and userId are required" },
        { status: 400 }
      );
    }

    // Check quiz exists and is published
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: { id: true, status: true, deadline: true, totalMarks: true },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    if (quiz.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Quiz is not available" },
        { status: 403 }
      );
    }

    // Check deadline
    if (quiz.deadline && new Date() > quiz.deadline) {
      return NextResponse.json(
        { error: "Quiz deadline has passed" },
        { status: 403 }
      );
    }

    // Check if attempt already exists
    const existing = await prisma.attempt.findUnique({
      where: { userId_quizId: { userId, quizId } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already attempted this quiz", attemptId: existing.id },
        { status: 409 }
      );
    }

    // Create new attempt
    const attempt = await prisma.attempt.create({
      data: {
        userId,
        quizId,
        totalMarks: quiz.totalMarks,
        status: "IN_PROGRESS",
      },
    });

    return NextResponse.json({ attempt }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/attempts]", error);
    return NextResponse.json(
      { error: "Failed to start attempt" },
      { status: 500 }
    );
  }
}
