"use client";

import { useState } from "react";

interface Props {
  topicId: string;
  initialCompleted: boolean;
}

export default function MarkCompleteButton({ topicId, initialCompleted }: Props) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const res = await fetch(`/api/topics/${topicId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !completed }),
    });
    if (res.ok) {
      setCompleted(!completed);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
        completed
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-indigo-600 text-white hover:bg-indigo-700"
      }`}
    >
      {loading ? "…" : completed ? "✓ Completed" : "Mark as Complete"}
    </button>
  );
}
