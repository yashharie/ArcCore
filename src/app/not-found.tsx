import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not Found — ArcCore",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-gray-500 text-sm mb-8 max-w-xs">
        The page you&apos;re looking for doesn&apos;t exist or you don&apos;t have
        permission to view it.
      </p>
      <div className="flex gap-3">
        <Link
          href="/dashboard"
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          Go to Dashboard
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
