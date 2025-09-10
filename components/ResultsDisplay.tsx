"use client";
import React from "react";
import KeyboardHint from "@/components/KeyboardHint";
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

export default function ResultsDisplayFixed({
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
  const incorrectChars = Math.max(0, totalChars - correctChars);
  const durationText =
    duration >= 60
      ? `${Math.floor(duration / 60)}m ${duration % 60}s`
      : `${duration}s`;

  return (
    <div className="w-full min-h-[420px] flex items-center justify-center p-6">
      <div className="relative max-w-[1100px] w-full">
        {/* Outer panel with 1px border */}
        <div
          className="relative rounded-2xl bg-neutral-900/85"
          style={{
            border: "1px solid rgba(120,120,125,0.12)",
            boxShadow:
              "0 8px 36px rgba(2,6,23,0.6), inset 0 1px 0 rgba(255,255,255,0.02)",
            padding: "40px 48px",
            zIndex: 5,
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-semibold text-white leading-tight">
              Results
            </h2>
            <p className="text-sm text-neutral-400 mt-2">
              Duration: {durationText}
            </p>
          </div>

          {/* Primary metrics - only these three cards now */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Net WPM */}
            <div
              className="group relative cursor-pointer rounded-xl p-6 bg-neutral-800/50 border border-neutral-700/30"
              style={{ minHeight: 130 }}
            >
              <div className="text-sm text-neutral-300 mb-2 uppercase tracking-wider">
                Net WPM
              </div>
              <div className="text-4xl font-mono font-bold text-cyan-400 mb-2">
                {netWpm}
              </div>
              <div className="text-xs text-neutral-500">
                Gross: {grossWpm} WPM
              </div>

              {/* hover tooltip */}
              <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-180 absolute -top-14 left-1/2 transform -translate-x-1/2">
                <div className="bg-black/90 text-white text-xs font-mono px-3 py-2 rounded-md shadow-md">
                  <div>{netWpm} net</div>
                  <div className="mt-1 text-neutral-400 text-[11px]">
                    Gross {grossWpm} WPM
                  </div>
                </div>
              </div>
            </div>

            {/* Accuracy */}
            <div
              className="group relative cursor-pointer rounded-xl p-6 bg-neutral-800/50 border border-neutral-700/30"
              style={{ minHeight: 130 }}
            >
              <div className="text-sm text-neutral-300 mb-2 uppercase tracking-wider">
                Accuracy
              </div>
              <div className="text-4xl font-mono font-bold text-emerald-300 mb-2">
                {Math.round(accuracy * 100)}%
              </div>
              <div className="text-xs text-neutral-500">
                {correctKeystrokes}/{totalKeystrokes} keystrokes
              </div>

              <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-180 absolute -top-14 left-1/2 transform -translate-x-1/2">
                <div className="bg-black/90 text-white text-xs font-mono px-3 py-2 rounded-md shadow-md">
                  <div>{(accuracy * 100).toFixed(2)}% accurate</div>
                  <div className="mt-1 text-neutral-400 text-[11px]">
                    {correctKeystrokes} correct / {totalKeystrokes}
                  </div>
                </div>
              </div>
            </div>

            {/* Characters */}
            <div
              className="group relative cursor-pointer rounded-xl p-6 bg-neutral-800/50 border border-neutral-700/30"
              style={{ minHeight: 130 }}
            >
              <div className="text-sm text-neutral-300 mb-2 uppercase tracking-wider">
                Characters
              </div>

              <div className="flex items-center gap-6">
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
                Word accuracy:{" "}
                {totalWords > 0
                  ? Math.round((correctWords / totalWords) * 100)
                  : 0}
                %
              </div>

              <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-180 absolute -top-14 left-1/2 transform -translate-x-1/2">
                <div className="bg-black/90 text-white text-xs font-mono px-3 py-2 rounded-md shadow-md">
                  <div>{correctChars} correct</div>
                  <div className="mt-1 text-neutral-400 text-[11px]">
                    {incorrectChars} incorrect
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* single refresh icon action */}
          {/* single refresh icon action */}
          <button
            aria-label="Retry test"
            onClick={() => onRetry()}
            title="Restart"
            className="absolute left-1/2 transform -translate-x-1/2 bottom-4 cursor-pointer w-8 h-8 rounded-full bg-neutral-900/70 border border-neutral-700/30 flex items-center justify-center shadow-md hover:scale-105 transition-transform"
            style={{ zIndex: 10 }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="text-cyan-400"
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

        {/* subtle outer border glow (keeps consistent UI separation) */}
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
      <KeyboardHint className="!fixed !bottom-8" label="retry test" />
    </div>
  );
}
