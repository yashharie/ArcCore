"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Quiz = {
  id: string;
  title: string;
  status: string;
  _count: { questions: number };
};

type ExamQuiz = {
  id: string;
  quizId: string;
  order: number;
  quiz: Quiz;
};

type Exam = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  scheduledAt: string;
  duration: number;
  totalMarks: number;
  examQuizzes: ExamQuiz[];
};

const EXAM_STATUSES = ["SCHEDULED", "ONGOING", "COMPLETED", "CANCELLED"] as const;

export default function EditExamPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [exam, setExam] = useState<Exam | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState("60");
  const [status, setStatus] = useState("SCHEDULED");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [addingQuiz, setAddingQuiz] = useState(false);

  const load = useCallback(async () => {
    const [examRes, quizzesRes] = await Promise.all([
      fetch(`/api/exams/${id}`),
      fetch("/api/quizzes"),
    ]);
    const examData = await examRes.json();
    const quizzesData = await quizzesRes.json();

    if (!examRes.ok) {
      setError(examData.error || "Failed to load exam.");
      return;
    }

    const e: Exam = examData.exam;
    setExam(e);
    setTitle(e.title);
    setDescription(e.description ?? "");
    const dt = new Date(e.scheduledAt);
    const pad = (n: number) => String(n).padStart(2, "0");
    setScheduledAt(
      `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`
    );
    setDuration(String(e.duration));
    setStatus(e.status);

    const publishedQuizzes = (quizzesData.quizzes ?? []).filter(
      (q: Quiz) => q.status === "PUBLISHED"
    );
    setAllQuizzes(publishedQuizzes);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);

    const res = await fetch(`/api/exams/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: description || undefined,
        scheduledAt: new Date(scheduledAt).toISOString(),
        duration: Number(duration),
        status,
      }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(
        data.issues?.map((i: { message: string }) => i.message).join(", ") ||
          data.error ||
          "Failed to save."
      );
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function addQuiz() {
    if (!selectedQuizId) return;
    setAddingQuiz(true);
    setError("");

    const res = await fetch(`/api/exams/${id}/quizzes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quizId: selectedQuizId }),
    });
    const data = await res.json();
    setAddingQuiz(false);

    if (!res.ok) {
      setError(data.error || "Failed to add quiz.");
      return;
    }

    setSelectedQuizId("");
    load();
  }

  async function removeQuiz(quizId: string) {
    setError("");
    const res = await fetch(`/api/exams/${id}/quizzes`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quizId }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to remove quiz.");
      return;
    }
    load();
  }

  async function deleteExam() {
    if (!confirm("Delete this exam? This cannot be undone.")) return;
    setDeleting(true);
    const res = await fetch(`/api/exams/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/exams");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to delete.");
      setDeleting(false);
    }
  }

  if (!exam && !error) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-gray-500">Loading…</p>
      </main>
    );
  }

  const addedQuizIds = new Set(exam?.examQuizzes.map((eq) => eq.quizId) ?? []);
  const availableToAdd = allQuizzes.filter((q) => !addedQuizIds.has(q.id));

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/exams" className="text-sm text-indigo-600 hover:underline">
          ← Exams
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Manage Exam</h1>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4 mb-6">
        <h2 className="font-semibold text-gray-900">Exam Details</h2>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">Title</label>
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">Description</label>
          <textarea
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600">
              Scheduled Date & Time
            </label>
            <input
              type="datetime-local"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600">
              Duration (minutes)
            </label>
            <input
              type="number"
              min={1}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">Status</label>
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {EXAM_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}
        {saved && (
          <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600">
            ✓ Saved successfully.
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <button
            onClick={deleteExam}
            disabled={deleting}
            className="ml-auto rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            {deleting ? "Deleting…" : "Delete Exam"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            Quizzes in Exam ({exam?.examQuizzes.length ?? 0})
          </h2>
          <span className="text-xs text-gray-400">
            Total: {exam?.totalMarks ?? 0} marks
          </span>
        </div>

        {exam?.examQuizzes.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No quizzes added yet.</p>
        )}

        {(exam?.examQuizzes ?? []).map((eq, idx) => (
          <div
            key={eq.id}
            className="flex items-center gap-3 rounded-xl border border-gray-100 px-4 py-3"
          >
            <span className="text-xs font-medium text-gray-400">{idx + 1}.</span>
            <span className="flex-1 text-sm text-gray-900">{eq.quiz.title}</span>
            <span className="text-xs text-gray-400">
              {eq.quiz._count.questions} Qs
            </span>
            <button
              onClick={() => removeQuiz(eq.quizId)}
              className="text-xs text-red-500 hover:text-red-700 ml-2"
            >
              Remove
            </button>
          </div>
        ))}

        {availableToAdd.length > 0 && (
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <select
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedQuizId}
              onChange={(e) => setSelectedQuizId(e.target.value)}
            >
              <option value="">— Select a published quiz —</option>
              {availableToAdd.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title} ({q._count.questions} Qs)
                </option>
              ))}
            </select>
            <button
              onClick={addQuiz}
              disabled={!selectedQuizId || addingQuiz}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {addingQuiz ? "Adding…" : "Add"}
            </button>
          </div>
        )}

        {availableToAdd.length === 0 && allQuizzes.length > 0 && (
          <p className="text-xs text-gray-400 pt-2">
            All published quizzes have been added to this exam.
          </p>
        )}

        {allQuizzes.length === 0 && (
          <p className="text-xs text-gray-400 pt-2">
            No published quizzes available.{" "}
            <Link href="/quizzes/new" className="text-indigo-600 hover:underline">
              Create and publish a quiz first.
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
