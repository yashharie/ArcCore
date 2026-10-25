// Topics page — Full topic listing with create, view, and track progress

import Link from "next/link";
import { requireAuth } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Topics — ArcCore",
  description: "Browse learning topics shared by members.",
};

export const instant = false;

export default async function TopicsPage() {
  const user = await requireAuth();

  const where =
    user.role === "ADMIN"
      ? {}
      : { OR: [{ published: true }, { authorId: user.id }] };

  const topics = await prisma.topic.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true } },
      _count: { select: { topicProgress: true } },
    },
  });

  // Get current user's progress
  const progress = await prisma.topicProgress.findMany({
    where: { userId: user.id },
    select: { topicId: true, completed: true },
  });
  const progressMap = new Map(progress.map((p) => [p.topicId, p.completed]));

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav user={user} />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📚 Topics</h1>
            <p className="mt-1 text-sm text-gray-500">
              Learning materials shared by group members.
            </p>
          </div>
          <Link
            href="/topics/new"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            + New Topic
          </Link>
        </div>

        {topics.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-16 text-center">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-gray-500 text-sm">
              No topics yet. Be the first to share one!
            </p>
            <Link
              href="/topics/new"
              className="mt-4 inline-block text-sm text-indigo-600 hover:underline"
            >
              Create a topic →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {topics.map((topic) => {
              const isComplete = progressMap.get(topic.id);
              const hasViewed = progressMap.has(topic.id);
              const isOwner = topic.authorId === user.id || user.role === "ADMIN";

              return (
                <div
                  key={topic.id}
                  className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {!topic.published && (
                          <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                            Draft
                          </span>
                        )}
                        {isComplete && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            ✓ Completed
                          </span>
                        )}
                        {!isComplete && hasViewed && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                            Viewed
                          </span>
                        )}
                      </div>
                      <h2 className="font-semibold text-gray-900 truncate">
                        {topic.title}
                      </h2>
                      {topic.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {topic.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 flex items-center justify-between">
                    <span>By {topic.author.name}</span>
                    <span>{topic._count.topicProgress} views</span>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Link
                      href={`/topics/${topic.id}`}
                      className="flex-1 text-center rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
                    >
                      Read
                    </Link>
                    {isOwner && (
                      <Link
                        href={`/topics/${topic.id}/edit`}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Edit
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
