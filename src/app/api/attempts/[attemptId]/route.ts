// GET /api/attempts/[attemptId] — Get a single attempt with answers for review

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
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
          orderBy: {
            question: { orderIndex: "asc" },
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Only the owner can view their attempt
    if (attempt.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ attempt });
  } catch (error) {
    console.error("[GET /api/attempts/[attemptId]]", error);
    return NextResponse.json(
      { error: "Failed to fetch attempt" },
      { status: 500 }
    );
  }
}
