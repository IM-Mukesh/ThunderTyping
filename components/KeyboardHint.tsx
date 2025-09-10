// components/KeyboardHint.tsx
import React from "react";

interface KeyboardHintProps {
  /**
   * Optional extra className to control positioning.
   * Default is the fixed bottom-center style used on the homepage.
   */
  className?: string;
  /**
   * Optional label text to show after the keys.
   * Defaults to "restart test" or "retry test" can be changed by parent.
   */
  label?: React.ReactNode;
}

/**
 * Reusable Tab + Enter keyboard hint.
 * Use the same component both in TypingTest (global) and in ResultsDisplay (overlay)
 * to keep consistent appearance.
 */
export default function KeyboardHint({
  className = "",
  label,
}: KeyboardHintProps) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10 ${className}`.trim()}
      aria-hidden
    >
      <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 backdrop-blur-md px-3 py-2 rounded-full">
        <span className="font-mono text-slate-300">tab</span>
        <span className="text-slate-500">+</span>
        <span className="font-mono text-slate-300">enter</span>
        <span className="text-slate-500">-</span>
        <span className="text-slate-300">{label ?? "restart test"}</span>
      </div>
    </div>
  );
}
