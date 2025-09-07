"use client";

interface TimerDisplayProps {
  timeLeft: number;
  isActive: boolean;
}

function formatSmart(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s === 0 ? `${m}m` : `${m}:${String(s).padStart(2, "0")}`;
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function TimerDisplay({
  timeLeft,
  isActive,
}: TimerDisplayProps) {
  const colorClass =
    timeLeft <= 10
      ? "text-red-400 animate-pulse"
      : timeLeft <= 30
      ? "text-amber-400"
      : "text-cyan-400";

  return (
    <div className="mb-4 h-12 flex items-center justify-center">
      <div
        className={`text-3xl font-mono font-bold transition-colors duration-300 ${colorClass} ${
          !isActive ? "opacity-50" : ""
        }`}
        aria-live="polite"
      >
        {formatSmart(timeLeft)}
      </div>
    </div>
  );
}
