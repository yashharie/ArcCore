import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ArcCore — Learn. Grow. Achieve.",
  description:
    "ArcCore is a collaborative learning and quiz platform — share knowledge, create quizzes, track progress, and compete on the leaderboard.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#070b14] text-white overflow-x-hidden">

      {/* ─── NAVBAR ─────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#070b14]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.svg" alt="ArcCore" width={40} height={40} priority />
            <span className="text-xl font-extrabold tracking-tight">
              <span className="text-[#f5c842]">Arc</span>
              <span className="text-[#4db8ff]">Core</span>
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: "Home", active: true },
              { label: "Quizzes" },
              { label: "Community" },
              { label: "About" },
            ].map((item) => (
              <span
                key={item.label}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium cursor-default transition-colors ${
                  item.active
                    ? "text-white border-b-2 border-[#4db8ff]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {item.label}
              </span>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button className="hidden md:flex items-center justify-center w-9 h-9 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
              <SearchIcon />
            </button>
            <Link
              href="/login"
              className="rounded-full bg-[#4db8ff] px-5 py-1.5 text-sm font-bold text-[#070b14] hover:bg-[#70caff] transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO ───────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background glow blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#1a3a6e]/40 blur-[120px]" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-[#0d2d5a]/50 blur-[100px]" />
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full bg-[#1e1a3e]/60 blur-[80px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20">
          {/* Left — copy */}
          <div>
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-[#f5c842]" />
              <span className="text-[#f5c842] text-xs font-semibold tracking-[0.2em] uppercase">
                Your Learning Journey, Powered By
              </span>
              <div className="h-px w-8 bg-[#f5c842]" />
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6">
              <span className="text-white">Learn Today.</span>
              <br />
              <span className="text-[#f5c842]">Build </span>
              <span className="text-[#4db8ff]">Tomorrow.</span>
            </h1>

            <p className="text-gray-400 text-base leading-relaxed max-w-md mb-8">
              ArcCore is a collaborative learning platform where curiosity meets
              technology. Learn, practice, and grow with your team — one step at a time.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-full bg-[#4db8ff] px-7 py-3 text-sm font-bold text-[#070b14] hover:bg-[#70caff] transition-colors shadow-lg shadow-[#4db8ff]/20"
              >
                Start Learning
                <ArrowIcon />
              </Link>
            </div>

            {/* Stats bar */}
            <div className="mt-12 flex flex-wrap gap-8">
              <StatItem icon={<MembersIcon />} value="5+" label="Active Members" />
              <StatItem icon={<ResourcesIcon />} value="100+" label="Learning Resources" />
              <StatItem icon={<TrackIcon />} value="Track" label="Your Progress" />
            </div>
          </div>

          {/* Right — orbital visual */}
          <div className="relative flex items-center justify-center">
            {/* Outer decorative text */}
            <div className="absolute top-4 right-0 text-right z-10">
              <p className="font-bold text-white/20 text-lg italic leading-tight">
                Small<br />Steps<br />Big Goals
              </p>
            </div>

            {/* Orbital ring SVG */}
            <div className="relative w-[380px] h-[380px] flex items-center justify-center">
              {/* Outer dotted circle */}
              <svg className="absolute inset-0 w-full h-full animate-[spin_40s_linear_infinite]" viewBox="0 0 380 380">
                <circle cx="190" cy="190" r="182" fill="none" stroke="#1e3a6e" strokeWidth="1" strokeDasharray="4 6" />
              </svg>

              {/* Gold arc (top) */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 380 380">
                <path
                  d="M 65,110 A 140,140 0 0,1 315,110"
                  fill="none"
                  stroke="url(#goldGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#c9a227" />
                    <stop offset="50%" stopColor="#f5d060" />
                    <stop offset="100%" stopColor="#c9a227" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Blue arcs (sides) */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 380 380">
                <defs>
                  <linearGradient id="blueGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#1a6ab5" />
                    <stop offset="100%" stopColor="#4fc3f7" />
                  </linearGradient>
                </defs>
                <path d="M 62,115 A 140,140 0 0,0 110,295" fill="none" stroke="url(#blueGrad)" strokeWidth="8" strokeLinecap="round" />
                <path d="M 318,115 A 140,140 0 0,1 270,295" fill="none" stroke="url(#blueGrad)" strokeWidth="8" strokeLinecap="round" />
              </svg>

              {/* Inner platform / glow */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                {/* Platform glow rings */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <div className="absolute w-48 h-48 rounded-full border border-[#1e3a6e]/60" />
                  <div className="absolute w-36 h-36 rounded-full border border-[#1e5090]/50" />
                  <div className="absolute w-24 h-24 rounded-full border border-[#2060b0]/60" />
                  <div className="absolute w-16 h-16 rounded-full bg-[#0a2050]/80 border border-[#3070c0]/60" />

                  {/* Core orb */}
                  <div className="relative z-20 w-10 h-10 rounded-full bg-[#4db8ff] shadow-[0_0_30px_10px_rgba(77,184,255,0.4)]" />

                  {/* Tick marks */}
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-0.5 h-2 bg-[#1e3a6e]"
                      style={{
                        transformOrigin: "50% 96px",
                        transform: `rotate(${i * 30}deg)`,
                        top: "calc(50% - 96px)",
                        left: "calc(50% - 1px)",
                      }}
                    />
                  ))}
                </div>

                {/* Base platform ellipse */}
                <div className="w-40 h-5 rounded-full bg-gradient-to-r from-transparent via-[#1e3a6e]/60 to-transparent mt-1 blur-sm" />
              </div>

              {/* Gold diamond sparks */}
              {[
                { top: "8%", left: "47%", size: 12 },
                { top: "47%", left: "2%", size: 10 },
                { top: "47%", right: "2%", size: 10 },
                { bottom: "8%", left: "47%", size: 12 },
              ].map((pos, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{ ...pos, width: pos.size, height: pos.size }}
                >
                  <svg viewBox="0 0 12 12" fill="none">
                    <polygon points="6,0 12,6 6,12 0,6" fill="#f5d060" opacity="0.9" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURE CARDS ──────────────────────────────────────────────── */}
      <section className="bg-[#080d18] py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: <BookIcon />,
              color: "#4d6bcb",
              title: "Learn",
              desc: "Explore curated topics and build your skills with structured content.",
            },
            {
              icon: <QuizIcon />,
              color: "#8b5cf6",
              title: "Quiz",
              desc: "Test your knowledge with fun and engaging quizzes.",
            },
            {
              icon: <CollabIcon />,
              color: "#10b981",
              title: "Collaborate",
              desc: "Learn together, share ideas, and grow as a team.",
            },
            {
              icon: <ChartIcon />,
              color: "#f59e0b",
              title: "Track Progress",
              desc: "See your growth, earn badges, and stay motivated.",
            },
          ].map((card) => (
            <FeatureCard key={card.title} {...card} />
          ))}
        </div>
      </section>

      {/* ─── WHY ARCCORE ────────────────────────────────────────────────── */}
      <section className="bg-[#070b14] py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Left text */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-6 bg-[#f5c842]" />
              <span className="text-[#f5c842] text-xs font-semibold tracking-[0.2em] uppercase">
                Why ArcCore?
              </span>
            </div>
            <h2 className="text-4xl font-extrabold leading-tight mb-6">
              <span className="text-white">More Than Just</span>
              <br />
              <span className="text-[#f5c842]">Learning</span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              ArcCore combines learning, collaboration, and gamification to give you
              a complete and engaging experience. Whether you&apos;re here to gain new
              skills, prepare for exams, or grow{" "}
              <span className="text-[#4db8ff]">with your team</span> — ArcCore is
              your space.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Learn More <ArrowIcon />
            </Link>
          </div>

          {/* Centre — benefit list */}
          <div className="lg:col-span-1 space-y-5">
            {[
              {
                icon: <LightbulbIcon />,
                color: "#f59e0b",
                title: "Interactive Learning",
                desc: "Engaging content, not just theory.",
              },
              {
                icon: <StarIcon />,
                color: "#f59e0b",
                title: "Gamified Experience",
                desc: "Earn points, unlock achievements.",
              },
              {
                icon: <TeamIcon />,
                color: "#10b981",
                title: "Team Collaboration",
                desc: "Learn, compete, and grow together.",
              },
              {
                icon: <ShieldIcon />,
                color: "#4d6bcb",
                title: "Secure & Private",
                desc: "Your data, always protected.",
              },
            ].map((item) => (
              <BenefitRow key={item.title} {...item} />
            ))}
          </div>

          {/* Right — city image */}
          <div className="relative hidden lg:flex items-center justify-center">
            {/* Decorative outer rings */}
            <div className="absolute w-[360px] h-[360px] rounded-full border border-[#1e3a6e]/20" />
            <div className="absolute w-[320px] h-[320px] rounded-full border border-[#1e3a6e]/15" />

            {/* Main image — circular clip matching the design */}
            <div className="relative w-72 h-72 rounded-full overflow-hidden border-2 border-[#1e3a6e]/50 shadow-2xl shadow-[#4db8ff]/10">
              <Image
                src="/city-hero.png"
                alt="Student with backpack looking at a futuristic city skyline at sunset"
                fill
                className="object-cover object-[60%_20%] scale-110"
                priority
              />
              {/* Bottom fade to blend with dark section bg */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#070b14]/50 via-transparent to-transparent" />
              {/* Left fade */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#070b14]/30 via-transparent to-transparent" />
            </div>

            {/* Decorative "Better Skills Brighter Future" text */}
            <div className="absolute -right-4 top-6 text-right pointer-events-none">
              <p className="font-bold text-white/25 text-lg italic leading-snug">
                Better<br />Skills<br />Brighter<br />Future
              </p>
            </div>

            {/* Glowing dot accents */}
            <div className="absolute top-4 left-1/2 w-2 h-2 rounded-full bg-[#f5d060] shadow-[0_0_8px_2px_rgba(245,208,96,0.6)]" />
            <div className="absolute bottom-4 left-1/2 w-2 h-2 rounded-full bg-[#f5d060] shadow-[0_0_8px_2px_rgba(245,208,96,0.6)]" />
            <div className="absolute left-4 top-1/2 w-2 h-2 rounded-full bg-[#4db8ff] shadow-[0_0_8px_2px_rgba(77,184,255,0.6)]" />
            <div className="absolute right-4 top-1/2 w-2 h-2 rounded-full bg-[#4db8ff] shadow-[0_0_8px_2px_rgba(77,184,255,0.6)]" />
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="bg-[#050810] border-t border-white/5 py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Image src="/logo.svg" alt="ArcCore" width={28} height={28} />
          <span className="text-base font-bold">
            <span className="text-[#f5c842]">Arc</span>
            <span className="text-[#4db8ff]">Core</span>
          </span>
        </div>
        <p className="text-gray-600 text-xs">
          © 2026 ArcCore · Learn. Grow. Achieve.
        </p>
      </footer>

    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FeatureCard({
  icon,
  color,
  title,
  desc,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="group relative rounded-2xl border border-white/5 bg-[#0d1424] p-6 hover:border-white/10 hover:bg-[#111827] transition-all cursor-default">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
        style={{ backgroundColor: color + "22" }}
      >
        <div style={{ color }}>{icon}</div>
      </div>
      <h3 className="text-base font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
      <div className="mt-5 flex items-center justify-end">
        <span className="text-gray-500 group-hover:text-white transition-colors text-lg">→</span>
      </div>
    </div>
  );
}

function BenefitRow({
  icon,
  color,
  title,
  desc,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div
        className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: color + "22", border: `1px solid ${color}44` }}
      >
        <div style={{ color }}>{icon}</div>
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function StatItem({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-[#4db8ff]">{icon}</div>
      <div>
        <p className="text-base font-bold text-white leading-tight">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function MembersIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="15" cy="7" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M1 18c0-3.3 3.1-6 7-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10 18c0-3.3 2.2-6 5-6s5 2.7 5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ResourcesIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="3" width="7" height="9" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="12" y="3" width="7" height="9" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="14" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="12" y="14" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function TrackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M3 17L8 11l4 3 4-6 3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M4 4h7v14H4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M11 4h7v14h-7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M4 8h7M4 12h7M11 8h7M11 12h7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function QuizIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="3" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 8h8M7 12h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14 12l2 2 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CollabIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="5" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 13.5C8 11.5 5 11 5 14M14 13.5C14 11.5 17 11 17 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M8.5 17c0-2 1.2-3.5 2.5-3.5s2.5 1.5 2.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="12" width="4" height="7" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="9" y="7" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="15" y="3" width="4" height="16" rx="1" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function LightbulbIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 2a5 5 0 015 5c0 2-1.2 3.7-3 4.5V13H7v-1.5C5.2 10.7 4 9 4 7a5 5 0 015-5z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
      <path d="M9 1l2.5 5 5.5.8-4 3.9.9 5.5L9 13.5l-4.9 2.7.9-5.5-4-3.9L6.5 6z" />
    </svg>
  );
}

function TeamIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 16c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 2L3 5v5c0 3.5 2.5 6.8 6 8 3.5-1.2 6-4.5 6-8V5L9 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M6 9l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
