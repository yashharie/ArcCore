// GET   /api/topics/[id] — Get a single topic
// PATCH /api/topics/[id] — Update topic (author or admin)
// DELETE /api/topics/[id] — Delete topic (author or admin)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthForApi } from "@/lib/auth/authorization";
import { updateTopicSchema } from "@/lib/validation/topic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const auth = await requireAuthForApi();
  if (auth.error) return auth.error;
  const user = auth.user;
  const { id } = await params;

  const topic = await prisma.topic.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true } },
      _count: { select: { topicProgress: true } },
    },
  });

  if (!topic) {
    return NextResponse.json({ error: "Topic not found." }, { status: 404 });
  }

  // Members can only see published topics or their own drafts
  if (
    user.role !== "ADMIN" &&
    !topic.published &&
    topic.authorId !== user.id
  ) {
    return NextResponse.json({ error: "Topic not found." }, { status: 404 });
  }

  return NextResponse.json({ topic });
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const auth = await requireAuthForApi();
  if (auth.error) return auth.error;
  const user = auth.user;
  const { id } = await params;

  const topic = await prisma.topic.findUnique({ where: { id } });
  if (!topic) {
    return NextResponse.json({ error: "Topic not found." }, { status: 404 });
  }

  if (user.role !== "ADMIN" && topic.authorId !== user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = updateTopicSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const updated = await prisma.topic.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ topic: updated });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const auth = await requireAuthForApi();
  if (auth.error) return auth.error;
  const user = auth.user;
  const { id } = await params;

  const topic = await prisma.topic.findUnique({ where: { id } });
  if (!topic) {
    return NextResponse.json({ error: "Topic not found." }, { status: 404 });
  }

  if (user.role !== "ADMIN" && topic.authorId !== user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  await prisma.topic.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
