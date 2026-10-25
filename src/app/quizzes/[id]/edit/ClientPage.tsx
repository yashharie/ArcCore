"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type QType = "MCQ" | "TRUE_FALSE" | "DROPDOWN" | "FILL_BLANK" | "MATCHING";
type Question = {
  id: string;
  type: string;
  text: string;
  marks: number;
  order: number;
};
type Quiz = {
  id: string;
  title: string;
  status: string;
  questions: Question[];
};

const BLANK = "___";
const emptyPairs = () => [
  { left: "", right: "" },
  { left: "", right: "" },
  { left: "", right: "" },
  { left: "", right: "" },
];

export default function EditQuizPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState("");

  const [type, setType] = useState<QType>("MCQ");
  const [text, setText] = useState("");
  const [marks, setMarks] = useState("1");
  const [choices, setChoices] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);
  const [tfValue, setTfValue] = useState(true);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [blankAnswers, setBlankAnswers] = useState<string[]>([]);
  const [pairs, setPairs] = useState(emptyPairs());

  const blankCount = text.split(BLANK).length - 1;

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

  function showError(data: { error?: string; issues?: { message: string }[] }) {
    setError(
      data.issues?.map((i) => i.message).join(", ") ||
        data.error ||
        "Something went wrong."
    );
  }

  function resetForm() {
    setText("");
    setChoices(["", "", "", ""]);
    setCorrect(0);
    setBlankAnswers([]);
    setPairs(emptyPairs());
  }

  function buildBody(): Record<string, unknown> {
    const base = { type, text, marks: Number(marks) || 1 };

    if (type === "MCQ" || type === "DROPDOWN") {
      const options = choices
        .map((c, i) => ({ id: String.fromCharCode(97 + i), text: c.trim() }))
        .filter((c) => c.text);
      return {
        ...base,
        options,
        correctAnswer: { optionId: String.fromCharCode(97 + correct) },
      };
    }

    if (type === "TRUE_FALSE") {
      return { ...base, correctAnswer: { value: tfValue } };
    }

    if (type === "FILL_BLANK") {
      const blanks = Array.from({ length: blankCount }, (_, i) =>
        (blankAnswers[i] ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      );
      return {
        ...base,
        options: { caseSensitive },
        correctAnswer: { blanks },
      };
    }

    // MATCHING
    const left: { id: string; text: string }[] = [];
    const right: { id: string; text: string }[] = [];
    const correctPairs: { left: string; right: string }[] = [];
    pairs.forEach((p, i) => {
      if (p.left.trim() && p.right.trim()) {
        left.push({ id: `l${i + 1}`, text: p.left.trim() });
        right.push({ id: `r${i + 1}`, text: p.right.trim() });
        correctPairs.push({ left: `l${i + 1}`, right: `r${i + 1}` });
      }
    });
    return {
      ...base,
      options: { left, right },
      correctAnswer: { pairs: correctPairs },
    };
  }

  async function addQuestion() {
    setError("");
    const res = await fetch(`/api/quizzes/${id}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildBody()),
    });
    const data = await res.json();
    if (!res.ok) return showError(data);
    resetForm();
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
      <main className="mx-auto max-w-2xl px-4 py-10">
        {error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <p className="text-gray-500">Loading quiz…</p>
        )}
      </main>
    );
  }

  const typeLabels: Record<QType, string> = {
    MCQ: "Multiple Choice",
    TRUE_FALSE: "True / False",
    DROPDOWN: "Dropdown",
    FILL_BLANK: "Fill in the Blank",
    MATCHING: "Matching",
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/quizzes" className="text-sm text-indigo-600 hover:underline">
          ← Quizzes
        </Link>
      </div>

      <div className="mb-2 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Status:{" "}
            <span className={quiz.status === "DRAFT" ? "text-yellow-600" : "text-green-600"}>
              {quiz.status}
            </span>{" "}
            · {quiz.questions.length} question{quiz.questions.length !== 1 ? "s" : ""}
          </p>
        </div>
        {quiz.status === "DRAFT" && (
          <button
            id="publish-quiz-btn"
            onClick={publish}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
          >
            Publish Quiz
          </button>
        )}
      </div>

      {/* Question list */}
      {quiz.questions.length > 0 && (
        <ul className="mb-8 mt-6 space-y-2">
          {quiz.questions.map((q) => (
            <li
              key={q.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3"
            >
              <span className="text-sm text-gray-800">
                <span className="mr-2 font-medium text-gray-500">{q.order}.</span>
                {q.text}
                <span className="ml-2 text-xs text-gray-400">
                  ({q.type}, {q.marks} mark{q.marks !== 1 ? "s" : ""})
                </span>
              </span>
              {quiz.status === "DRAFT" && (
                <button
                  onClick={() => deleteQuestion(q.id)}
                  className="ml-4 shrink-0 text-sm text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Add question form */}
      {quiz.status === "DRAFT" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Add Question</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Type</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={type}
                onChange={(e) => setType(e.target.value as QType)}
              >
                {(Object.keys(typeLabels) as QType[]).map((t) => (
                  <option key={t} value={t}>
                    {typeLabels[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Marks</label>
              <input
                type="number"
                min={1}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Question Text</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={
                type === "FILL_BLANK"
                  ? "e.g. The capital of France is ___."
                  : "Question text"
              }
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          {(type === "MCQ" || type === "DROPDOWN") && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">Select the radio button next to the correct option.</p>
              {choices.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct"
                    checked={correct === i}
                    onChange={() => setCorrect(i)}
                    className="accent-indigo-600"
                  />
                  <input
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder={`Option ${i + 1}`}
                    value={c}
                    onChange={(e) =>
                      setChoices(choices.map((x, j) => (j === i ? e.target.value : x)))
                    }
                  />
                </div>
              ))}
            </div>
          )}

          {type === "TRUE_FALSE" && (
            <div className="flex gap-6">
              {[true, false].map((v) => (
                <label key={String(v)} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="tfValue"
                    checked={tfValue === v}
                    onChange={() => setTfValue(v)}
                    className="accent-indigo-600"
                  />
                  {v ? "True" : "False"}
                </label>
              ))}
            </div>
          )}

          {type === "FILL_BLANK" && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">
                Use ___ (3 underscores) in the text for each blank. Blanks found: {blankCount}
              </p>
              {Array.from({ length: blankCount }, (_, i) => (
                <input
                  key={i}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={`Blank ${i + 1} accepted answers (comma-separated)`}
                  value={blankAnswers[i] ?? ""}
                  onChange={(e) => {
                    const next = [...blankAnswers];
                    next[i] = e.target.value;
                    setBlankAnswers(next);
                  }}
                />
              ))}
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={caseSensitive}
                  onChange={(e) => setCaseSensitive(e.target.checked)}
                />
                Case sensitive
              </label>
            </div>
          )}

          {type === "MATCHING" && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">
                Each row is a correct pair. Students will see the right side in a dropdown.
              </p>
              {pairs.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder={`Left ${i + 1}`}
                    value={p.left}
                    onChange={(e) =>
                      setPairs(pairs.map((x, j) => (j === i ? { ...x, left: e.target.value } : x)))
                    }
                  />
                  <input
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder={`Right ${i + 1}`}
                    value={p.right}
                    onChange={(e) =>
                      setPairs(pairs.map((x, j) => (j === i ? { ...x, right: e.target.value } : x)))
                    }
                  />
                </div>
              ))}
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
          )}

          <button
            id="add-question-btn"
            onClick={addQuestion}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            Add Question
          </button>
        </div>
      )}
    </main>
  );
}
