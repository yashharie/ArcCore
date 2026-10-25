// POST /api/topics/[id]/progress — Mark a topic as viewed / completed for current user

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthForApi } from "@/lib/auth/authorization";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Ctx) {
  const auth = await requireAuthForApi();
  if (auth.error) return auth.error;
  const user = auth.user;
  const { id } = await params;

  const topic = await prisma.topic.findUnique({ where: { id } });
  if (!topic || (!topic.published && topic.authorId !== user.id && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Topic not found." }, { status: 404 });
  }

  let completed = false;
  try {
    const body = await request.json();
    completed = Boolean(body?.completed);
  } catch {
    // default: mark as viewed (not completed)
  }

  const progress = await prisma.topicProgress.upsert({
    where: { userId_topicId: { userId: user.id, topicId: id } },
    create: { userId: user.id, topicId: id, completed, viewedAt: new Date() },
    update: { completed, viewedAt: new Date() },
  });

  return NextResponse.json({ progress });
}
