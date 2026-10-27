import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import MemberShell from "./MemberShell";

export const metadata: Metadata = { title: "Dashboard — ArcCore" };
export const instant = false;

export default async function DashboardPage() {
  const user = await requireAuth();

  const [attempts, topicsViewed, leaderboardEntry, availableQuizzes, totalTopics, allTopics] =
    await Promise.all([
      prisma.attempt.findMany({
        where: { userId: user.id, status: "SUBMITTED" },
        include: { quiz: { select: { id: true, title: true } } },
        orderBy: { submittedAt: "desc" },
        take: 5,
      }),
      prisma.topicProgress.count({ where: { userId: user.id } }),
      prisma.leaderboard.findUnique({ where: { userId: user.id } }),
      prisma.quiz.count({ where: { status: "PUBLISHED" } }),
      prisma.topic.count({ where: { published: true } }),
      prisma.topic.findMany({
        where: { published: true },
        take: 4,
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, description: true, _count: { select: { topicProgress: true } } },
      }),
    ]);

  const totalScore = attempts.reduce((s, a) => s + a.score, 0);
  const totalMax   = attempts.reduce((s, a) => s + a.totalMarks, 0);
  const avgScore   = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

  const level = Math.floor(attempts.length / 3) + 1;
  const xpCurrent = (attempts.length % 3) * 100;
  const xpMax     = 300;

  const recentActivity = attempts.slice(0, 5).map((a) => ({
    icon: "✓",
    color: "#00d4aa",
    title: `Completed quiz`,
    sub: a.quiz.title,
    time: a.submittedAt ? timeAgo(a.submittedAt) : "",
  }));

  return (
    <MemberShell
      user={user}
      level={level}
      xpCurrent={xpCurrent}
      xpMax={xpMax}
      stats={{
        coursesEnrolled: topicsViewed,
        quizzesTaken: attempts.length,
        totalPoints: totalScore,
        rank: leaderboardEntry?.rank ?? null,
        avgScore,
      }}
      attempts={attempts.map((a) => ({
        id: a.id,
        title: a.quiz.title,
        pct: a.totalMarks > 0 ? Math.round((a.score / a.totalMarks) * 100) : 0,
      }))}
      topics={allTopics.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        views: t._count.topicProgress,
      }))}
      recentActivity={recentActivity}
      availableQuizzes={availableQuizzes}
      totalTopics={totalTopics}
    />
  );
}

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
