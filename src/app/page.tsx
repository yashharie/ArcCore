import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-indigo-700 mb-4">
          ArcCore ⚡
        </h1>
        <p className="text-xl text-gray-600 mb-2 font-medium">
          Learn. Challenge. Evolve.
        </p>
        <p className="text-gray-500 mb-10">
          A collaborative learning and quiz platform for your group.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/leaderboard"
            className="bg-white text-indigo-600 border border-indigo-300 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
          >
            View Leaderboard
          </Link>
        </div>
      </div>
    </main>
  );
}
