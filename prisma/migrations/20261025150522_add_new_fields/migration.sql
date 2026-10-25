/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "QuizStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ', 'TRUE_FALSE', 'DROPDOWN', 'FILL_BLANK', 'MATCHING');

-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'TIMED_OUT');

-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "tempPasswordHash" TEXT,
    "tempPasswordExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topics" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizzes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "topicId" TEXT,
    "createdById" TEXT NOT NULL,
    "timeLimitMinutes" INTEGER,
    "startsAt" TIMESTAMP(3),
    "deadline" TIMESTAMP(3),
    "status" "QuizStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "text" TEXT NOT NULL,
    "options" JSONB,
    "correctAnswer" JSONB NOT NULL,
    "marks" INTEGER NOT NULL DEFAULT 1,
    "explanation" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_assignments" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "userId" TEXT,
    "assignedToAll" BOOLEAN NOT NULL DEFAULT false,
    "examId" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "status" "AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "score" INTEGER NOT NULL DEFAULT 0,
    "totalMarks" INTEGER NOT NULL DEFAULT 0,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "timeTaken" INTEGER,

    CONSTRAINT "attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attempt_answers" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "submittedAnswer" JSONB NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "marksAwarded" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attempt_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaderboard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "quizzesTaken" INTEGER NOT NULL DEFAULT 0,
    "totalCorrect" INTEGER NOT NULL DEFAULT 0,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "averageScorePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_leaderboard" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "scorePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "timeTaken" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topic_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "topic_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exams" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdById" TEXT NOT NULL,
    "status" "ExamStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "totalMarks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_quizzes" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "exam_quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "quizzes_createdById_idx" ON "quizzes"("createdById");

-- CreateIndex
CREATE INDEX "quizzes_topicId_idx" ON "quizzes"("topicId");

-- CreateIndex
CREATE INDEX "quizzes_status_idx" ON "quizzes"("status");

-- CreateIndex
CREATE INDEX "questions_quizId_order_idx" ON "questions"("quizId", "order");

-- CreateIndex
CREATE INDEX "quiz_assignments_userId_idx" ON "quiz_assignments"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_assignments_quizId_userId_key" ON "quiz_assignments"("quizId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "attempts_userId_quizId_key" ON "attempts"("userId", "quizId");

-- CreateIndex
CREATE UNIQUE INDEX "leaderboard_userId_key" ON "leaderboard"("userId");

-- CreateIndex
CREATE INDEX "quiz_leaderboard_quizId_scorePercent_timeTaken_idx" ON "quiz_leaderboard"("quizId", "scorePercent", "timeTaken");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_leaderboard_quizId_userId_key" ON "quiz_leaderboard"("quizId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "topic_progress_userId_topicId_key" ON "topic_progress"("userId", "topicId");

-- CreateIndex
CREATE INDEX "exams_createdById_idx" ON "exams"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "exam_quizzes_examId_quizId_key" ON "exam_quizzes"("examId", "quizId");

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_assignments" ADD CONSTRAINT "quiz_assignments_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_assignments" ADD CONSTRAINT "quiz_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaderboard" ADD CONSTRAINT "leaderboard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_leaderboard" ADD CONSTRAINT "quiz_leaderboard_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_leaderboard" ADD CONSTRAINT "quiz_leaderboard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_progress" ADD CONSTRAINT "topic_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_progress" ADD CONSTRAINT "topic_progress_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_quizzes" ADD CONSTRAINT "exam_quizzes_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_quizzes" ADD CONSTRAINT "exam_quizzes_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
