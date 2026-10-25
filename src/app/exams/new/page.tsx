import { Suspense } from "react";
import NewExamClientPage from "./ClientPage";

export const instant = false;

export default function NewExamPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-xl px-4 py-10 text-gray-500">Loading…</div>}>
      <NewExamClientPage />
    </Suspense>
  );
}
