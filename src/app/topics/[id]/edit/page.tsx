import { Suspense } from "react";
import EditTopicClientPage from "./ClientPage";

export const instant = false;

export default function EditTopicPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl px-4 py-10 text-gray-500">Loading…</div>}>
      <EditTopicClientPage />
    </Suspense>
  );
}
