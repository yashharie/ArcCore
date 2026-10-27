"use client";
import { useState } from "react";

export default function MarkCompleteButton({ topicId, initialCompleted }: { topicId: string; initialCompleted: boolean }) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const res = await fetch(`/api/topics/${topicId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !completed }),
    });
    if (res.ok) setCompleted(!completed);
    setLoading(false);
  }

  return (
    <button onClick={toggle} disabled={loading}
      className="arc-btn text-xs disabled:opacity-50"
      style={completed ? { background: "rgba(0,212,170,0.15)", color: "#00d4aa", border: "1px solid rgba(0,212,170,0.3)" } : {}}>
      {loading ? "…" : completed ? "✓ Completed" : "Mark as Complete"}
    </button>
  );
}
