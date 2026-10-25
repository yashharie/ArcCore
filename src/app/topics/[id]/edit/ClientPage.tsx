"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Topic = {
  id: string;
  title: string;
  description: string | null;
  content: string;
  published: boolean;
  authorId: string;
};

export default function EditTopicPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [topic, setTopic] = useState<Topic | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/topics/${id}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to load topic.");
      return;
    }
    const t: Topic = data.topic;
    setTopic(t);
    setTitle(t.title);
    setDescription(t.description ?? "");
    setContent(t.content);
    setPublished(t.published);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function save(publishNow?: boolean) {
    setError("");
    setSaving(true);
    setSaved(false);

    const body: Record<string, unknown> = {
      title,
      description: description || undefined,
      content,
    };
    if (publishNow !== undefined) body.published = publishNow;
    else body.published = published;

    const res = await fetch(`/api/topics/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(
        data.issues?.map((i: { message: string }) => i.message).join(", ") ||
          data.error ||
          "Failed to save."
      );
      return;
    }

    if (publishNow !== undefined) setPublished(publishNow);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function deleteTopic() {
    if (!confirm("Delete this topic? This cannot be undone.")) return;
    setDeleting(true);
    const res = await fetch(`/api/topics/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/topics");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to delete.");
      setDeleting(false);
    }
  }

  if (!topic && !error) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-gray-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/topics" className="text-sm text-indigo-600 hover:underline">
          ← Topics
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Topic</h1>
        {published && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
            Published
          </span>
        )}
        {!published && (
          <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700">
            Draft
          </span>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={16}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}
        {saved && (
          <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600">
            ✓ Saved successfully.
          </p>
        )}

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => save()}
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving…" : "Save"}
          </button>

          {!published && (
            <button
              onClick={() => save(true)}
              disabled={saving}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              Publish
            </button>
          )}

          {published && (
            <button
              onClick={() => save(false)}
              disabled={saving}
              className="rounded-lg border border-yellow-300 px-4 py-2 text-sm font-semibold text-yellow-700 hover:bg-yellow-50 disabled:opacity-50 transition-colors"
            >
              Unpublish
            </button>
          )}

          <button
            onClick={deleteTopic}
            disabled={deleting}
            className="ml-auto rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            {deleting ? "Deleting…" : "Delete Topic"}
          </button>
        </div>
      </div>
    </main>
  );
}
