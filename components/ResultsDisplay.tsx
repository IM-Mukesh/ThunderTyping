"use client";
import React, { useMemo } from "react";

interface ResultsDisplayProps {
  grossWpm: number;
  netWpm: number;
  accuracy: number; // 0..1
  correctChars: number;
  totalChars: number;
  correctWords: number;
  totalWords: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  backspaceCount: number;
  duration: number; // seconds
  onRetry: () => void;
  onNewTest: () => void;
}

/**
 * Lightweight tooltip component (pointer-events removed except when visible)
 * Keeps DOM stable and removes extra recalculations from parent render.
 */
function Tooltip({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute -top-14 left-1/2 transform -translate-x-1/2">
      <div className="bg-black/90 text-white text-xs font-mono px-3 py-2 rounded-md shadow-md">
        {children}
      </div>
    </div>
  );
}

function MetricCard({
  title,
  children,
  hoverContent,
}: {
  title: string;
  children: React.ReactNode;
  hoverContent?: React.ReactNode;
}) {
  return (
    <div
      className="group relative cursor-default rounded-xl p-6 bg-neutral-800/50 border border-neutral-700/30 min-h-[130px]"
      role="group"
    >
      <div className="text-sm text-neutral-300 mb-2 uppercase tracking-wider">
        {title}
      </div>
      <div>{children}</div>
      {hoverContent ? <Tooltip>{hoverContent}</Tooltip> : null}
    </div>
  );
}

function formatDuration(d: number) {
  if (d >= 60) return `${Math.floor(d / 60)}m ${d % 60}s`;
  return `${d}s`;
}

const ResultsDisplay = React.memo(function ResultsDisplay({
  grossWpm,
  netWpm,
  accuracy,
  correctChars,
  totalChars,
  correctWords,
  totalWords,
  totalKeystrokes,
  correctKeystrokes,
  backspaceCount,
  duration,
  onRetry,
  onNewTest,
}: ResultsDisplayProps) {
  // memoize derived values to avoid recalculation on every parent render
  const incorrectChars = useMemo(
    () => Math.max(0, totalChars - correctChars),
    [totalChars, correctChars]
  );

  const durationText = useMemo(() => formatDuration(duration), [duration]);

  const wordAccuracy = useMemo(
    () => (totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 0),
    [correctWords, totalWords]
  );

  return (
    <div className="w-full flex items-center justify-center p-6">
      {/* constrain height and allow scroll on small screens so layout is responsive */}
      <div
        className="relative max-w-[1100px] w-full overflow-auto"
        style={{
          // ensure the panel never grows larger than the viewport space (overlay accounts for footer)
          maxHeight: "calc(100vh - var(--footer-height, 64px) - 48px)", // 48px buffer for comfortable spacing
        }}
      >
        {/* Outer panel */}
        <div
          className="relative rounded-2xl bg-neutral-900/85 border"
          style={{
            borderColor: "rgba(120,120,125,0.12)",
            padding: "40px 24px",
            boxShadow:
              "0 8px 36px rgba(2,6,23,0.6), inset 0 1px 0 rgba(255,255,255,0.02)",
            zIndex: 5,
          }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-white leading-tight">
              Result
            </h2>
            <p className="text-sm text-neutral-400 mt-2">
              Duration: {durationText}
            </p>
          </div>

          {/* Primary metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <MetricCard
              title="Net WPM"
              hoverContent={
                <>
                  <div>{netWpm} net</div>
                  <div className="mt-1 text-neutral-400 text-[11px]">
                    Gross {grossWpm} WPM
                  </div>
                </>
              }
            >
              <div className="text-3xl md:text-4xl font-mono font-bold text-cyan-400 mb-1">
                {netWpm}
              </div>
              <div className="text-xs text-neutral-500">
                Gross: {grossWpm} WPM
              </div>
            </MetricCard>

            <MetricCard
              title="Accuracy"
              hoverContent={
                <>
                  <div>{(accuracy * 100).toFixed(2)}% accurate</div>
                  <div className="mt-1 text-neutral-400 text-[11px]">
                    {correctKeystrokes} correct / {totalKeystrokes}
                  </div>
                </>
              }
            >
              <div className="text-3xl md:text-4xl font-mono font-bold text-emerald-300 mb-1">
                {Math.round(accuracy * 100)}%
              </div>
              <div className="text-xs text-neutral-500">
                {correctKeystrokes}/{totalKeystrokes} keystrokes
              </div>
            </MetricCard>

            <MetricCard
              title="Characters"
              hoverContent={
                <>
                  <div>{correctChars} correct</div>
                  <div className="mt-1 text-neutral-400 text-[11px]">
                    {incorrectChars} incorrect
                  </div>
                </>
              }
            >
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-emerald-300">
                    ✓
                  </div>
                  <div className="font-mono text-white text-lg">
                    {correctChars}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-rose-400">
                    ✕
                  </div>
                  <div className="font-mono text-neutral-300 text-lg">
                    {incorrectChars}
                  </div>
                </div>
              </div>

              <div className="text-xs text-neutral-500 mt-3">
                Word accuracy: {wordAccuracy}%
              </div>
            </MetricCard>
          </div>

          {/* Actions (center) */}
          <div className="flex items-center justify-center gap-4 mt-2">
            <button
              aria-label="Retry test"
              onClick={onRetry}
              title="Restart"
              className="cursor-pointer w-10 h-10 rounded-full bg-neutral-900/70 border border-neutral-700/30 flex items-center justify-center shadow-md hover:scale-105 transition-transform"
              style={{ zIndex: 10 }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M21 12a9 9 0 10-8.94 9"
                  stroke="#52C7FF"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 3v6h-6"
                  stroke="#52C7FF"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* subtle outer border glow */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            border: "1px solid rgba(38,198,218,0.04)",
            boxShadow: "0 10px 40px rgba(2,6,23,0.6)",
            zIndex: 1,
          }}
        />
      </div>
    </div>
  );
});

export default ResultsDisplay;
