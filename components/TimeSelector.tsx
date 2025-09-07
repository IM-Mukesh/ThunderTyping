"use client";
import { cn } from "@/lib/utils";

const PRESETS = [15, 30, 60, 120]; // seconds

interface TimeSelectorProps {
  duration: number; // seconds
  onDurationChange: (duration: number) => void;
  disabled?: boolean;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds} s`;
  const m = Math.floor(seconds / 60);
  return `${m} m`;
}

/**
 * Updated TimeSelector with "Select Test Duration" title
 * - Shows title above buttons
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
    <div className="space-y-3 w-full">
      {/* Title */}
      {/* <div className="text-center">
        <h3 className="text-neutral-300 text-sm font-medium">
          Select Test Duration
        </h3>
      </div> */}

      {/* Preset buttons */}
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
    </div>
  );
}
