// GET  /api/topics — List topics
// POST /api/topics — Create a new topic (any authenticated user)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthForApi } from "@/lib/auth/authorization";
import { topicSchema } from "@/lib/validation/topic";

export async function GET() {
  const auth = await requireAuthForApi();
  if (auth.error) return auth.error;
  const user = auth.user;

  // ADMIN sees all; MEMBER sees published + own drafts
  const where =
    user.role === "ADMIN"
      ? {}
      : {
          OR: [{ published: true }, { authorId: user.id }],
        };

  const topics = await prisma.topic.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      published: true,
      createdAt: true,
      authorId: true,
      author: { select: { id: true, name: true } },
      _count: { select: { topicProgress: true } },
    },
  });

  return NextResponse.json({ topics });
}

export async function POST(request: Request) {
  const auth = await requireAuthForApi();
  if (auth.error) return auth.error;
  const user = auth.user;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = topicSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const topic = await prisma.topic.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      content: parsed.data.content,
      authorId: user.id,
      published: false,
    },
  });

  return NextResponse.json({ topic }, { status: 201 });
}
