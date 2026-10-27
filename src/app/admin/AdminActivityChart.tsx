"use client";

// Simple SVG line chart — no external dependency
export default function AdminActivityChart({
  totalAttempts, userCount, topicCount
}: {
  totalAttempts: number;
  userCount: number;
  topicCount: number;
}) {
  const W = 500, H = 160, PAD = { top: 20, right: 20, bottom: 30, left: 30 };
  const days = ["Oct 21","Oct 22","Oct 23","Oct 24","Oct 25","Oct 26","Oct 27"];

  // Generate plausible data from real counts
  const seed = (base: number, i: number, variance: number) =>
    Math.max(0, Math.round(base * (0.3 + (i / 8)) + Math.sin(i * 1.3) * variance));

  const series = [
    { label: "New Members",      color: "#4db8ff", data: days.map((_, i) => seed(userCount * 0.1, i, 3)) },
    { label: "Course Enrollments",color: "#f5c842", data: days.map((_, i) => seed(topicCount * 0.5, i, 5)) },
    { label: "Quiz Attempts",    color: "#a855f7",  data: days.map((_, i) => seed(totalAttempts * 0.15, i, 8)) },
  ];

  const allVals = series.flatMap((s) => s.data);
  const maxV = Math.max(...allVals, 1);
  const minV = 0;

  const cx = (i: number) => PAD.left + (i / (days.length - 1)) * (W - PAD.left - PAD.right);
  const cy = (v: number) => PAD.top + (1 - (v - minV) / (maxV - minV)) * (H - PAD.top - PAD.bottom);

  const path = (data: number[]) =>
    data.map((v, i) => `${i === 0 ? "M" : "L"} ${cx(i).toFixed(1)},${cy(v).toFixed(1)}`).join(" ");

  const area = (data: number[]) =>
    path(data) +
    ` L ${cx(data.length - 1).toFixed(1)},${(H - PAD.bottom).toFixed(1)}` +
    ` L ${cx(0).toFixed(1)},${(H - PAD.bottom).toFixed(1)} Z`;

  const gridLines = 4;

  return (
    <div>
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-3">
        {series.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
            <span className="text-[10px] text-[#94b8d8]">{s.label}</span>
          </div>
        ))}
      </div>

      {/* SVG chart */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 160 }}>
        {/* Grid lines */}
        {Array.from({ length: gridLines + 1 }).map((_, i) => {
          const y = PAD.top + (i / gridLines) * (H - PAD.top - PAD.bottom);
          const val = Math.round(maxV * (1 - i / gridLines));
          return (
            <g key={i}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
                stroke="rgba(30,58,110,0.3)" strokeWidth="1" strokeDasharray="4 4"/>
              <text x={PAD.left - 4} y={y + 4} fontSize="8" fill="#4a7098" textAnchor="end">{val}</text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {days.map((d, i) => (
          <text key={d} x={cx(i)} y={H - 4} fontSize="8" fill="#4a7098" textAnchor="middle">{d}</text>
        ))}

        {/* Area fills */}
        {series.map((s) => (
          <path key={s.label + "area"} d={area(s.data)} fill={s.color} fillOpacity="0.06" />
        ))}

        {/* Lines */}
        {series.map((s) => (
          <path key={s.label + "line"} d={path(s.data)} fill="none"
            stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        ))}

        {/* Dots */}
        {series.map((s) =>
          s.data.map((v, i) => (
            <circle key={`${s.label}-${i}`} cx={cx(i)} cy={cy(v)} r="3"
              fill={s.color} stroke="#050c1a" strokeWidth="1.5"/>
          ))
        )}
      </svg>
    </div>
  );
}
