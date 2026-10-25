"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  quizId: string;
}

export default function QuizArchiveButton({ quizId }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function archive() {
    if (!confirm("Archive this quiz? It will no longer be available to take.")) return;
    setLoading(true);
    const res = await fetch(`/api/quizzes/${quizId}/archive`, { method: "POST" });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <button
      onClick={archive}
      disabled={loading}
      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
    >
      {loading ? "…" : "Archive"}
    </button>
  );
}
