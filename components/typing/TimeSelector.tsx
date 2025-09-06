"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

const PRESETS = [15, 30, 60, 12000]; // seconds

interface TimeSelectorProps {
  duration: number; // seconds
  onDurationChange: (duration: number) => void;
  disabled?: boolean;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

/**
 * Simplified TimeSelector:
 * - Shows only four centered preset buttons (15s, 30s, 1m, 2m)
 * - Disabled while test is running/finished
 * - Highlights the currently selected preset
 */
export default function TimeSelector({
  duration,
  onDurationChange,
  disabled = false,
}: TimeSelectorProps) {
  return (
    <div className="space-y-2 w-full">
      <div className="flex items-center justify-center gap-2 text-neutral-300">
        <Clock className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-medium">Select Test Duration</h3>
      </div>

      <div className="flex items-center justify-center gap-3">
        {PRESETS.map((p) => {
          const isActive = p === duration;
          return (
            <button
              key={p}
              onClick={() => onDurationChange(p)}
              disabled={disabled}
              aria-pressed={isActive}
              className={cn(
                "h-9 px-4 rounded-full text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400",
                isActive
                  ? // active style: cyan background with subtle shadow
                    "bg-cyan-500 text-black hover:bg-cyan-400 shadow-md shadow-cyan-500/20"
                  : // inactive style
                    "bg-neutral-800 hover:bg-neutral-700 text-neutral-200",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {formatTime(p)}
            </button>
          );
        })}
      </div>

      <div className="text-center text-xs text-neutral-400">
        Current: {formatTime(duration)}
      </div>
    </div>
  );
}
