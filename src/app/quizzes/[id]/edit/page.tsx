"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Option = { id: string; text: string };
type Question = {
  id: string;
  type: string;
  text: string;
  options: Option[] | null;
  correctAnswer: { optionId?: string; value?: boolean };
  marks: number;
  order: number;
};
type Quiz = {
  id: string;
  title: string;
  status: string;
  questions: Question[];
};

export default function EditQuizPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState("");

  const [type, setType] = useState<"MCQ" | "TRUE_FALSE">("MCQ");
  const [text, setText] = useState("");
  const [marks, setMarks] = useState("1");
  const [choices, setChoices] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);
  const [tfValue, setTfValue] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch(`/api/quizzes/${id}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to load quiz.");
      return;
    }
    setQuiz(data.quiz);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  function showError(data: {
    error?: string;
    issues?: { message: string }[];
  }) {
    setError(
      data.issues?.map((i) => i.message).join(", ") ||
        data.error ||
        "Something went wrong."
    );
  }

  async function addQuestion() {
    setError("");
    let body: Record<string, unknown>;
    if (type === "MCQ") {
      const filled = choices
        .map((c, i) => ({ id: String.fromCharCode(97 + i), text: c.trim() }))
        .filter((c) => c.text);
      body = {
        type,
        text,
        marks: Number(marks) || 1,
        options: filled,
        correctAnswer: { optionId: String.fromCharCode(97 + correct) },
      };
    } else {
      body = {
        type,
        text,
        marks: Number(marks) || 1,
        correctAnswer: { value: tfValue },
      };
    }
    const res = await fetch(`/api/quizzes/${id}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) return showError(data);
    setText("");
    setChoices(["", "", "", ""]);
    setCorrect(0);
    load();
  }

  async function deleteQuestion(qid: string) {
    const res = await fetch(`/api/quizzes/${id}/questions/${qid}`, {
      method: "DELETE",
    });
    if (!res.ok) return showError(await res.json());
    load();
  }

  async function publish() {
    setError("");
    const res = await fetch(`/api/quizzes/${id}/publish`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) return showError(data);
    router.push("/quizzes");
  }

  if (!quiz) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        {error ? <p className="text-red-600">{error}</p> : <p>Loading...</p>}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-1 text-2xl font-bold">{quiz.title}</h1>
      <p className="mb-6 text-sm text-gray-500">
        Status: {quiz.status} · {quiz.questions.length} questions
      </p>

      <ul className="mb-8 space-y-2">
        {quiz.questions.map((q) => (
          <li key={q.id} className="flex justify-between rounded border p-3">
            <span>
              {q.order}. {q.text}{" "}
              <span className="text-sm text-gray-500">
                ({q.type}, {q.marks} marks)
              </span>
            </span>
            {quiz.status === "DRAFT" && (
              <button
                onClick={() => deleteQuestion(q.id)}
                className="text-sm text-red-600"
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>

      {quiz.status === "DRAFT" && (
        <div className="space-y-3 rounded border p-4">
          <h2 className="font-semibold">Add question</h2>
          <select
            className="rounded border p-2"
            value={type}
            onChange={(e) => setType(e.target.value as "MCQ" | "TRUE_FALSE")}
          >
            <option value="MCQ">Multiple choice</option>
            <option value="TRUE_FALSE">True / False</option>
          </select>
          <input
            className="w-full rounded border p-2"
            placeholder="Question text"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="number"
            min={1}
            className="w-24 rounded border p-2"
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
          />

          {type === "MCQ" ? (
            <div className="space-y-2">
              {choices.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct"
                    checked={correct === i}
                    onChange={() => setCorrect(i)}
                  />
                  <input
                    className="flex-1 rounded border p-2"
                    placeholder={`Option ${i + 1}`}
                    value={c}
                    onChange={(e) =>
                      setChoices(
                        choices.map((x, j) => (j === i ? e.target.value : x))
                      )
                    }
                  />
                </div>
              ))}
              <p className="text-xs text-gray-500">
                Select the radio button next to the correct option.
              </p>
            </div>
          ) : (
            <div className="flex gap-4">
              <label>
                <input
                  type="radio"
                  checked={tfValue}
                  onChange={() => setTfValue(true)}
                />{" "}
                True
              </label>
              <label>
                <input
                  type="radio"
                  checked={!tfValue}
                  onChange={() => setTfValue(false)}
                />{" "}
                False
              </label>
            </div>
          )}

          <button
            onClick={addQuestion}
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            Add question
          </button>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {quiz.status === "DRAFT" && (
        <button
          onClick={publish}
          className="mt-6 rounded bg-green-600 px-4 py-2 text-white"
        >
          Publish quiz
        </button>
      )}
    </main>
  );
}