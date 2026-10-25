"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Option = { id: string; text: string };
type MatchOptions = { left: Option[]; right: Option[] };
type Question = {
  id: string;
  type: string;
  text: string;
  options: unknown;
  marks: number;
  order: number;
};
type Quiz = {
  id: string;
  title: string;
  description: string | null;
  timeLimitMinutes: number | null;
  questions: Question[];
};
type Answer =
  | { optionId: string }
  | { value: boolean }
  | { blanks: string[] }
  | { pairs: { left: string; right: string }[] };
type Answers = Record<string, Answer>;

const BLANK = "___";

export default function TakeQuizPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<Answers>({});
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const answersRef = useRef<Answers>({});
  const submittedRef = useRef(false);
  const attemptIdRef = useRef<string | null>(null);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // 1. Load quiz and start attempt
  useEffect(() => {
    (async () => {
      const quizRes = await fetch(`/api/quizzes/${id}/take`);
      const quizData = await quizRes.json();
      if (!quizRes.ok) {
        setError(quizData.error || "Cannot load quiz.");
        return;
      }
      setQuiz(quizData.quiz);
      if (quizData.quiz.timeLimitMinutes) {
        setSecondsLeft(quizData.quiz.timeLimitMinutes * 60);
      }

      const attemptRes = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId: id }),
      });
      const attemptData = await attemptRes.json();
      if (!attemptRes.ok) {
        if (attemptRes.status === 409 && attemptData.attemptId) {
          router.replace(`/results/${attemptData.attemptId}`);
          return;
        }
        setError(attemptData.error || "Could not start attempt.");
        return;
      }
      attemptIdRef.current = attemptData.attempt.id;
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function setAnswer(qid: string, value: Answer) {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }

  async function submit() {
    if (submittedRef.current || !attemptIdRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);

    const currentAnswers = answersRef.current;
    const formattedAnswers = Object.entries(currentAnswers).map(
      ([questionId, ans]) => ({ questionId, submittedAnswer: ans })
    );

    const res = await fetch(`/api/attempts/${attemptIdRef.current}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: formattedAnswers }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to submit. Please try again.");
      submittedRef.current = false;
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    router.push(`/results/${attemptIdRef.current}`);
  }

  // Countdown timer
  useEffect(() => {
    if (secondsLeft === null || submitted) return;
    if (secondsLeft <= 0) {
      submit();
      return;
    }
    const t = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, submitted]);

  if (error) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-xl bg-red-50 p-6 text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <Link href="/quizzes" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">
            ← Back to Quizzes
          </Link>
        </div>
      </main>
    );
  }

  if (!quiz || (!attemptIdRef.current && !error)) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-gray-500">Loading quiz…</p>
      </main>
    );
  }

  if (submitted || submitting) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 text-center">
        <p className="text-gray-600">Submitting your answers…</p>
      </main>
    );
  }

  const mm = secondsLeft !== null ? Math.floor(secondsLeft / 60) : 0;
  const ss = secondsLeft !== null ? secondsLeft % 60 : 0;

  function renderQuestion(q: Question) {
    const current = answers[q.id];

    if (q.type === "MCQ" || q.type === "DROPDOWN") {
      const opts = (q.options as Option[]) ?? [];
      const selectedId = (current as { optionId?: string })?.optionId;

      if (q.type === "DROPDOWN") {
        return (
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={selectedId ?? ""}
            onChange={(e) =>
              setAnswer(q.id, e.target.value ? { optionId: e.target.value } : { optionId: "" })
            }
          >
            <option value="">-- Select an answer --</option>
            {opts.map((o) => (
              <option key={o.id} value={o.id}>
                {o.text}
              </option>
            ))}
          </select>
        );
      }

      return (
        <div className="space-y-2">
          {opts.map((o) => (
            <label key={o.id} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name={q.id}
                checked={selectedId === o.id}
                onChange={() => setAnswer(q.id, { optionId: o.id })}
                className="accent-indigo-600"
              />
              <span className="text-sm text-gray-800">{o.text}</span>
            </label>
          ))}
        </div>
      );
    }

    if (q.type === "TRUE_FALSE") {
      const selectedValue = (current as { value?: boolean })?.value;
      return (
        <div className="flex gap-6">
          {[true, false].map((v) => (
            <label key={String(v)} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name={q.id}
                checked={selectedValue === v}
                onChange={() => setAnswer(q.id, { value: v })}
                className="accent-indigo-600"
              />
              {v ? "True" : "False"}
            </label>
          ))}
        </div>
      );
    }

    if (q.type === "FILL_BLANK") {
      const parts = q.text.split(BLANK);
      const count = parts.length - 1;
      const blanks =
        (current as { blanks?: string[] })?.blanks ??
        Array.from({ length: count }, () => "");
      return (
        <p className="leading-10 text-sm text-gray-800">
          {parts.map((part, i) => (
            <span key={i}>
              {part}
              {i < count && (
                <input
                  className="mx-1 w-32 rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={blanks[i] ?? ""}
                  onChange={(e) => {
                    const next = Array.from(
                      { length: count },
                      (_, k) => blanks[k] ?? ""
                    );
                    next[i] = e.target.value;
                    setAnswer(q.id, { blanks: next });
                  }}
                />
              )}
            </span>
          ))}
        </p>
      );
    }

    if (q.type === "MATCHING") {
      const opts = q.options as MatchOptions;
      const rightSorted = [...(opts?.right ?? [])].sort((a, b) =>
        a.text.localeCompare(b.text)
      );
      const pairs =
        (current as { pairs?: { left: string; right: string }[] })?.pairs ?? [];
      return (
        <div className="space-y-2">
          {(opts?.left ?? []).map((l) => (
            <div key={l.id} className="flex items-center gap-3">
              <span className="w-1/2 text-sm text-gray-800">{l.text}</span>
              <select
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={pairs.find((p) => p.left === l.id)?.right ?? ""}
                onChange={(e) => {
                  const rest = pairs.filter((p) => p.left !== l.id);
                  setAnswer(q.id, {
                    pairs: e.target.value
                      ? [...rest, { left: l.id, right: e.target.value }]
                      : rest,
                  });
                }}
              >
                <option value="">-- Match --</option>
                {rightSorted.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.text}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      );
    }

    return <p className="text-sm text-gray-400">Unsupported question type.</p>;
  }

  const answeredCount = Object.keys(answers).length;
  const totalCount = quiz.questions.length;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
          {quiz.description && (
            <p className="mt-1 text-sm text-gray-500">{quiz.description}</p>
          )}
        </div>
        {secondsLeft !== null && (
          <span
            className={`rounded-lg px-4 py-2 font-mono text-sm font-bold ${
              secondsLeft < 60
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
          </span>
        )}
      </div>

      <p className="mb-4 text-xs text-gray-500">
        {answeredCount} / {totalCount} answered
      </p>

      <div className="space-y-6">
        {quiz.questions.map((q, index) => (
          <div
            key={q.id}
            className={`rounded-xl border bg-white p-6 shadow-sm ${
              answers[q.id] ? "border-indigo-200" : "border-gray-200"
            }`}
          >
            <p className="mb-4 font-medium text-gray-900">
              <span className="mr-2 text-gray-400">{index + 1}.</span>
              {q.type === "FILL_BLANK" ? "Fill in the blank(s):" : q.text}
              <span className="ml-2 text-xs font-normal text-gray-400">
                ({q.marks} mark{q.marks !== 1 ? "s" : ""})
              </span>
            </p>
            {renderQuestion(q)}
          </div>
        ))}
      </div>

      <button
        id="submit-quiz-btn"
        onClick={submit}
        disabled={submitting}
        className="mt-8 w-full rounded-lg bg-green-600 px-6 py-3 text-base font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
      >
        {submitting
          ? "Submitting…"
          : `Submit Quiz (${answeredCount}/${totalCount} answered)`}
      </button>
    </main>
  );
}
