"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewQuizPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setError("");
    setLoading(true);
    const res = await fetch("/api/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: description || undefined,
        timeLimitMinutes: timeLimit ? Number(timeLimit) : undefined,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(
        data.issues?.map((i: { message: string }) => i.message).join(", ") ||
          data.error ||
          "Something went wrong."
      );
      return;
    }
    router.push(`/quizzes/${data.quiz.id}/edit`);
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/quizzes" className="text-sm text-indigo-600 hover:underline">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Quiz</h1>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="quiz-title"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. JavaScript Fundamentals Quiz"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="quiz-description"
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="What is this quiz about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Time Limit (minutes)
            </label>
            <input
              id="quiz-time-limit"
              type="number"
              min={1}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. 30"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Deadline
            </label>
            <input
              id="quiz-deadline"
              type="datetime-local"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          id="create-quiz-btn"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Creating…" : "Create Quiz & Add Questions →"}
        </button>
      </div>
    </main>
  );
}
