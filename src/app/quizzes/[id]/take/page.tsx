"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Option = { id: string; text: string };
type Question = {
  id: string;
  type: string;
  text: string;
  options: Option[] | null;
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

// questionId -> { optionId } | { value }
type Answers = Record<string, { optionId?: string; value?: boolean }>;

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

  // countdown + auto-submit
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
        <p className="mb-4 text-gray-600">
          Your answers have been recorded.
        </p>
        <Link href="/quizzes" className="text-blue-600 underline">
          Back to quizzes
        </Link>
      </main>
    );
  }

  const mm = secondsLeft !== null ? Math.floor(secondsLeft / 60) : 0;
  const ss = secondsLeft !== null ? secondsLeft % 60 : 0;

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
              {q.order}. {q.text}{" "}
              <span className="text-sm text-gray-500">({q.marks} marks)</span>
            </p>

            {q.type === "MCQ" && q.options && (
              <div className="space-y-2">
                {q.options.map((o) => (
                  <label key={o.id} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id]?.optionId === o.id}
                      onChange={() =>
                        setAnswers({ ...answers, [q.id]: { optionId: o.id } })
                      }
                    />
                    {o.text}
                  </label>
                ))}
              </div>
            )}

            {q.type === "TRUE_FALSE" && (
              <div className="flex gap-6">
                {[true, false].map((v) => (
                  <label key={String(v)} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id]?.value === v}
                      onChange={() =>
                        setAnswers({ ...answers, [q.id]: { value: v } })
                      }
                    />
                    {v ? "True" : "False"}
                  </label>
                ))}
              </div>
            )}

            {q.type !== "MCQ" && q.type !== "TRUE_FALSE" && (
              <p className="text-sm text-gray-500">
                This question type is not supported in the UI yet.
              </p>
            )}
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