import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center" style={{ background: "#050c1a" }}>
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full blur-2xl" style={{ background: "rgba(77,184,255,0.15)" }} />
        <div className="relative text-7xl font-extrabold" style={{ color: "#1e3a6e" }}>404</div>
      </div>
      <h1 className="text-2xl font-extrabold text-white mb-2">Page Not Found</h1>
      <p className="text-sm text-[#94b8d8] mb-8 max-w-xs">
        The page you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
      </p>
      <div className="flex gap-3">
        <Link href="/dashboard" className="arc-btn text-xs px-6">Go to Dashboard</Link>
        <Link href="/" className="arc-btn-outline text-xs px-6">Home</Link>
      </div>
    </div>
  );
}
