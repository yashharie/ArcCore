// Topic View Page — displays topic content and records progress

import { requireAuth } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Link from "next/link";
import MarkCompleteButton from "./MarkCompleteButton";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const instant = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const topic = await prisma.topic.findUnique({
    where: { id },
    select: { title: true },
  });
  return {
    title: topic ? `${topic.title} — ArcCore` : "Topic — ArcCore",
  };
}

export default async function TopicPage({ params }: PageProps) {
  const user = await requireAuth();
  const { id } = await params;

  const topic = await prisma.topic.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true } },
      _count: { select: { topicProgress: true } },
    },
  });

  if (!topic) notFound();

  // Members can only view published topics or their own drafts
  if (
    user.role !== "ADMIN" &&
    !topic.published &&
    topic.authorId !== user.id
  ) {
    notFound();
  }

  // Record view (fire-and-forget — don't block render)
  // We use the progress API here to log the view
  const progressEntry = await prisma.topicProgress.upsert({
    where: { userId_topicId: { userId: user.id, topicId: id } },
    create: { userId: user.id, topicId: id, completed: false, viewedAt: new Date() },
    update: { viewedAt: new Date() },
  });

  const isOwner = topic.authorId === user.id || user.role === "ADMIN";

  // Render markdown-like content: paragraph splits at double newlines, # for headings
  const lines = topic.content.split("\n");

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav user={user} />

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/topics" className="text-indigo-600 hover:underline">
            Topics
          </Link>
          <span>/</span>
          <span className="truncate">{topic.title}</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {!topic.published && (
                  <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                    Draft
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{topic.title}</h1>
              {topic.description && (
                <p className="mt-2 text-gray-500">{topic.description}</p>
              )}
              <p className="mt-3 text-xs text-gray-400">
                By {topic.author.name} ·{" "}
                {new Date(topic.createdAt).toLocaleDateString()} ·{" "}
                {topic._count.topicProgress} view
                {topic._count.topicProgress !== 1 ? "s" : ""}
              </p>
            </div>
            {isOwner && (
              <Link
                href={`/topics/${topic.id}/edit`}
                className="shrink-0 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Edit
              </Link>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-6 prose prose-sm max-w-none">
          {lines.map((line, i) => {
            if (line.startsWith("### ")) {
              return (
                <h3 key={i} className="text-base font-semibold text-gray-900 mt-5 mb-2">
                  {line.slice(4)}
                </h3>
              );
            }
            if (line.startsWith("## ")) {
              return (
                <h2 key={i} className="text-lg font-bold text-gray-900 mt-6 mb-3">
                  {line.slice(3)}
                </h2>
              );
            }
            if (line.startsWith("# ")) {
              return (
                <h1 key={i} className="text-xl font-bold text-gray-900 mt-6 mb-3">
                  {line.slice(2)}
                </h1>
              );
            }
            if (line.startsWith("- ") || line.startsWith("* ")) {
              return (
                <li key={i} className="ml-4 text-sm text-gray-700 list-disc">
                  {line.slice(2)}
                </li>
              );
            }
            if (line.trim() === "") {
              return <div key={i} className="h-3" />;
            }
            return (
              <p key={i} className="text-sm text-gray-700 leading-relaxed">
                {line}
              </p>
            );
          })}
        </div>

        {/* Progress actions */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/topics"
            className="text-sm text-indigo-600 hover:underline"
          >
            ← Back to Topics
          </Link>
          <MarkCompleteButton
            topicId={topic.id}
            initialCompleted={progressEntry.completed}
          />
        </div>
      </div>
    </div>
  );
}
