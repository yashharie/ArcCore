"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
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

type Answer = {
  optionId?: string;
  value?: boolean;
  blanks?: string[];
  pairs?: { left: string; right: string }[];
};
type Answers = Record<string, Answer>;

const BLANK = "___";

export default function TakeQuizPage() {
  const { id } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<Answers>({});
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const answersRef = useRef<Answers>({});
  const submittedRef = useRef(false);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/quizzes/${id}/take`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Cannot load quiz.");
        return;
      }
      setQuiz(data.quiz);
      if (data.quiz.timeLimitMinutes) {
        setSecondsLeft(data.quiz.timeLimitMinutes * 60);
      }
    })();
  }, [id]);

  function setAnswer(qid: string, value: Answer) {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }

  async function submit() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitted(true);

    // TODO (Member 4): replace with the real attempts API, e.g.
    // await fetch("/api/attempts", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ quizId: id, answers: answersRef.current }),
    // });
    console.log("SUBMIT", { quizId: id, answers: answersRef.current });
  }

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
      <main className="mx-auto max-w-2xl p-6">
        <p className="text-red-600">{error}</p>
        <Link href="/quizzes" className="text-blue-600 underline">
          Back to quizzes
        </Link>
      </main>
    );
  }
  if (!quiz) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <p>Loading...</p>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="mb-2 text-2xl font-bold">Submitted</h1>
        <p className="mb-4 text-gray-600">Your answers have been recorded.</p>
        <Link href="/quizzes" className="text-blue-600 underline">
          Back to quizzes
        </Link>
      </main>
    );
  }

  const mm = secondsLeft !== null ? Math.floor(secondsLeft / 60) : 0;
  const ss = secondsLeft !== null ? secondsLeft % 60 : 0;

  function renderQuestion(q: Question) {
    const current = answers[q.id] ?? {};

    if (q.type === "MCQ") {
      const opts = (q.options as Option[]) ?? [];
      return (
        <div className="space-y-2">
          {opts.map((o) => (
            <label key={o.id} className="flex items-center gap-2">
              <input
                type="radio"
                name={q.id}
                checked={current.optionId === o.id}
                onChange={() => setAnswer(q.id, { optionId: o.id })}
              />
              {o.text}
            </label>
          ))}
        </div>
      );
    }

    if (q.type === "DROPDOWN") {
      const opts = (q.options as Option[]) ?? [];
      return (
        <select
          className="rounded border p-2"
          value={current.optionId ?? ""}
          onChange={(e) =>
            setAnswer(q.id, e.target.value ? { optionId: e.target.value } : {})
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

    if (q.type === "TRUE_FALSE") {
      return (
        <div className="flex gap-6">
          {[true, false].map((v) => (
            <label key={String(v)} className="flex items-center gap-2">
              <input
                type="radio"
                name={q.id}
                checked={current.value === v}
                onChange={() => setAnswer(q.id, { value: v })}
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
      const blanks = current.blanks ?? Array.from({ length: count }, () => "");
      return (
        <p className="leading-10">
          {parts.map((part, i) => (
            <span key={i}>
              {part}
              {i < count && (
                <input
                  className="mx-1 w-32 rounded border px-2 py-1"
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
      // sorted by text so the order never reveals the correct pairing
      const rightSorted = [...(opts?.right ?? [])].sort((a, b) =>
        a.text.localeCompare(b.text)
      );
      const pairs = current.pairs ?? [];
      return (
        <div className="space-y-2">
          {(opts?.left ?? []).map((l) => (
            <div key={l.id} className="flex items-center gap-3">
              <span className="w-1/2">{l.text}</span>
              <select
                className="flex-1 rounded border p-2"
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
                <option value="">-- Select --</option>
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

    return <p className="text-sm text-gray-500">Unsupported question type.</p>;
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        {secondsLeft !== null && (
          <span
            className={`rounded px-3 py-1 font-mono ${
              secondsLeft < 60 ? "bg-red-100 text-red-700" : "bg-gray-100"
            }`}
          >
            {String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
          </span>
        )}
      </div>
      {quiz.description && (
        <p className="mb-6 text-gray-600">{quiz.description}</p>
      )}

      <div className="space-y-6">
        {quiz.questions.map((q) => (
          <div key={q.id} className="rounded border p-4">
            <p className="mb-3 font-medium">
              {q.order}.{" "}
              {q.type === "FILL_BLANK" ? "Fill in the blank(s)" : q.text}{" "}
              <span className="text-sm text-gray-500">({q.marks} marks)</span>
            </p>
            {renderQuestion(q)}
          </div>
        ))}
      </div>

      <button
        onClick={submit}
        className="mt-8 rounded bg-green-600 px-6 py-2 text-white"
      >
        Submit
      </button>
    </main>
  );
}