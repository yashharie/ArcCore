import Link from "next/link";
import { requireAuth } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

export default async function QuizzesPage() {
  const user = await requireAuth();

  const where =
    user.role === "ADMIN"
      ? {}
      : {
          OR: [
            { createdById: user.id },
            {
              status: "PUBLISHED" as const,
              assignments: {
                some: {
                  OR: [{ assignedToAll: true }, { userId: user.id }],
                },
              },
            },
          ],
        };

  const quizzes = await prisma.quiz.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { questions: true } } },
  });

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quizzes</h1>
        <Link
          href="/quizzes/new"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          New quiz
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <p className="text-gray-500">No quizzes yet. Create your first one.</p>
      ) : (
        <ul className="space-y-3">
          {quizzes.map((q) => {
            const canEdit =
              (q.createdById === user.id || user.role === "ADMIN") &&
              q.status === "DRAFT";
            return (
              <li key={q.id} className="rounded border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{q.title}</p>
                    <p className="text-sm text-gray-500">
                      {q._count.questions} questions
                      {q.timeLimitMinutes ? ` · ${q.timeLimitMinutes} min` : ""}
                      {" · "}
                      {q.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {canEdit && (
                      <Link
                        href={`/quizzes/${q.id}/edit`}
                        className="rounded border px-3 py-1 text-sm"
                      >
                        Edit
                      </Link>
                    )}
                    {q.status === "PUBLISHED" && (
                      <Link
                        href={`/quizzes/${q.id}/take`}
                        className="rounded bg-green-600 px-3 py-1 text-sm text-white"
                      >
                        Take
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}