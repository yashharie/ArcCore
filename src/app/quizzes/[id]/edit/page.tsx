"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
            onChange={(e) => setType(e.target.value as QType)}
          >
            <option value="MCQ">Multiple choice</option>
            <option value="TRUE_FALSE">True / False</option>
            <option value="DROPDOWN">Dropdown</option>
            <option value="FILL_BLANK">Fill in the blank</option>
            <option value="MATCHING">Matching</option>
          </select>

          <input
            className="w-full rounded border p-2"
            placeholder={
              type === "FILL_BLANK"
                ? "e.g. The capital of France is ___."
                : "Question text"
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="flex items-center gap-2">
            <label className="text-sm">Marks</label>
            <input
              type="number"
              min={1}
              className="w-24 rounded border p-2"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
            />
          </div>

          {(type === "MCQ" || type === "DROPDOWN") && (
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
          )}

          {type === "TRUE_FALSE" && (
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

          {type === "FILL_BLANK" && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">
                Use ___ (3 underscores) in the question text for each blank.
                Blanks found: {blankCount}
              </p>
              {Array.from({ length: blankCount }, (_, i) => (
                <input
                  key={i}
                  className="w-full rounded border p-2"
                  placeholder={`Blank ${i + 1} accepted answers (comma separated)`}
                  value={blankAnswers[i] ?? ""}
                  onChange={(e) => {
                    const next = [...blankAnswers];
                    next[i] = e.target.value;
                    setBlankAnswers(next);
                  }}
                />
              ))}
              <label className="flex items-center gap-2 text-sm">
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
                Each row is a correct pair (left matches right). Fill at least 2
                rows. Students will see the right side in a dropdown.
              </p>
              {pairs.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="flex-1 rounded border p-2"
                    placeholder={`Left ${i + 1}`}
                    value={p.left}
                    onChange={(e) =>
                      setPairs(
                        pairs.map((x, j) =>
                          j === i ? { ...x, left: e.target.value } : x
                        )
                      )
                    }
                  />
                  <input
                    className="flex-1 rounded border p-2"
                    placeholder={`Right ${i + 1}`}
                    value={p.right}
                    onChange={(e) =>
                      setPairs(
                        pairs.map((x, j) =>
                          j === i ? { ...x, right: e.target.value } : x
                        )
                      )
                    }
                  />
                </div>
              ))}
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