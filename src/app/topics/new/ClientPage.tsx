"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewTopicPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!content.trim()) {
      setError("Content is required.");
      return;
    }
    setError("");
    setLoading(true);

    const res = await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description: description || undefined, content }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(
        data.issues?.map((i: { message: string }) => i.message).join(", ") ||
          data.error ||
          "Something went wrong."
      );
      return;
    }
    router.push(`/topics/${data.topic.id}/edit`);
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/topics" className="text-sm text-indigo-600 hover:underline">
          ← Topics
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Topic</h1>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. Introduction to React Hooks"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Short Description
          </label>
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="One-sentence summary of this topic"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Content <span className="text-red-500">*</span>
          </label>
          <p className="mb-2 text-xs text-gray-400">
            Write your learning material here. Markdown is supported for display.
          </p>
          <textarea
            rows={16}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="## Introduction&#10;&#10;Write your topic content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Creating…" : "Save as Draft →"}
          </button>
        </div>
      </div>
    </main>
  );
}
