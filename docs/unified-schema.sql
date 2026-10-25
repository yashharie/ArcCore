-- ArcCore Unified Schema Migration
-- Run this on a fresh database: npx prisma migrate dev --name init
-- Or on an existing db: npx prisma migrate deploy

-- Member 1: Users & Auth
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Member 2: Topics (placeholder)
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

-- Member 3: Quizzes & Questions
CREATE TABLE "quizzes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "topicId" TEXT,
    "createdById" TEXT NOT NULL,
    "timeLimitMinutes" INTEGER,
    "startsAt" TIMESTAMP(3),
    "deadline" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "quizzes_createdById_idx" ON "quizzes"("createdById");
CREATE INDEX "quizzes_topicId_idx" ON "quizzes"("topicId");
CREATE INDEX "quizzes_status_idx" ON "quizzes"("status");

CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "options" JSONB,
    "correctAnswer" JSONB NOT NULL,
    "marks" INTEGER NOT NULL DEFAULT 1,
    "explanation" TEXT,
    "order" INTEGER NOT NULL,
    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "questions_quizId_order_idx" ON "questions"("quizId", "order");

CREATE TABLE "quiz_assignments" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "userId" TEXT,
    "assignedToAll" BOOLEAN NOT NULL DEFAULT false,
    "examId" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "quiz_assignments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "quiz_assignments_quizId_userId_key" ON "quiz_assignments"("quizId", "userId");
CREATE INDEX "quiz_assignments_userId_idx" ON "quiz_assignments"("userId");

-- Member 4: Attempts, Results & Leaderboard
CREATE TABLE "attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "score" INTEGER NOT NULL DEFAULT 0,
    "totalMarks" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "timeTaken" INTEGER,
    CONSTRAINT "attempts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "attempts_userId_quizId_key" ON "attempts"("userId", "quizId");

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

CREATE TABLE "leaderboard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "quizzesTaken" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "leaderboard_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "leaderboard_userId_key" ON "leaderboard"("userId");

CREATE TABLE "topic_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "topic_progress_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "topic_progress_userId_topicId_key" ON "topic_progress"("userId", "topicId");

-- Member 5: Exams (placeholder)
CREATE TABLE "exams" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdById" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "totalMarks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- Enum types
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MEMBER');
CREATE TYPE "QuizStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "QuestionType" AS ENUM ('MCQ', 'TRUE_FALSE', 'DROPDOWN', 'FILL_BLANK', 'MATCHING');
CREATE TYPE "AttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'TIMED_OUT');
CREATE TYPE "ExamStatus" AS ENUM ('SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- Foreign keys
ALTER TABLE "topics" ADD CONSTRAINT "topics_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "questions" ADD CONSTRAINT "questions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "quiz_assignments" ADD CONSTRAINT "quiz_assignments_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "quiz_assignments" ADD CONSTRAINT "quiz_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "leaderboard" ADD CONSTRAINT "leaderboard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "topic_progress" ADD CONSTRAINT "topic_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "topic_progress" ADD CONSTRAINT "topic_progress_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
