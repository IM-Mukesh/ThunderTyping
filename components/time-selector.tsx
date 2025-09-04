// src/components/typing/time-selector.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PRESETS = [15, 30, 60, 120]; // seconds
const MAX_SECONDS = 36000; // 10h

interface TimeSelectorProps {
  duration: number; // in seconds
  onDurationChange: (duration: number) => void;
  disabled?: boolean;
}

function clampToBounds(totalSeconds: number) {
  if (totalSeconds < 1) return 1;
  if (totalSeconds > MAX_SECONDS) return MAX_SECONDS;
  return totalSeconds;
}

function splitHMS(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return { h, m, s };
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s === 0 ? `${m}m` : `${m}m ${s}s`;
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (m === 0 && s === 0) return `${h}h`;
  return `${h}h ${m}m ${s}s`;
}

export function TimeSelector({
  duration,
  onDurationChange,
  disabled = false,
}: TimeSelectorProps) {
  // Local H/M/S state mirrors the external duration
  const [{ h, m, s }, setHMS] = useState(() =>
    splitHMS(clampToBounds(duration))
  );

  // Re-sync local dropdowns when parent updates `duration`
  useEffect(() => {
    const clamped = clampToBounds(duration);
    const next = splitHMS(clamped);
    setHMS(next);
  }, [duration]);

  // Option lists
  const hourOptions = useMemo(
    () => Array.from({ length: 11 }, (_, i) => i),
    []
  ); // 0..10
  const minuteSecondOptions = useMemo(
    () => Array.from({ length: 60 }, (_, i) => i),
    []
  );

  // Commit helper
  const commit = (next: { h: number; m: number; s: number }) => {
    // Cap to MAX_SECONDS and min 1s.
    // If the user selects 0h:0m:0s, bump to 1s to keep it valid.
    let total = next.h * 3600 + next.m * 60 + next.s;
    total = clampToBounds(total);
    if (total !== duration) onDurationChange(total);
    // Also reflect any clamp back into the local state
    const normalized = splitHMS(total);
    setHMS(normalized);
  };

  // Handlers for each dropdown
  const onHourChange = (val: string) => {
    const next = { h: parseInt(val, 10), m, s };
    setHMS(next);
    commit(next);
  };
  const onMinuteChange = (val: string) => {
    const next = { h, m: parseInt(val, 10), s };
    setHMS(next);
    commit(next);
  };
  const onSecondChange = (val: string) => {
    const next = { h, m, s: parseInt(val, 10) };
    setHMS(next);
    commit(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center gap-2 text-neutral-300">
        <Clock className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-medium">Select Test Duration</h3>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => onDurationChange(p)}
            disabled={disabled}
            className={cn(
              "h-8 px-3 rounded-full text-xs transition-all duration-150",
              p === duration
                ? "bg-cyan-500 text-black hover:bg-cyan-400 shadow-md shadow-cyan-500/20"
                : "bg-neutral-800 hover:bg-neutral-700 text-neutral-200",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {formatTime(p)}
          </button>
        ))}

        {/* HH / MM / SS dropdowns */}
        <div className="flex items-center gap-2">
          {/* Hours */}
          <Select
            value={String(h)}
            onValueChange={onHourChange}
            disabled={disabled}
          >
            <SelectTrigger className="h-8 w-[84px] px-2 text-xs bg-neutral-900 border-neutral-700 text-neutral-200">
              <SelectValue placeholder="HH" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              {hourOptions.map((opt) => (
                <SelectItem key={opt} value={String(opt)}>
                  {opt.toString().padStart(2, "0")} h
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Minutes */}
          <Select
            value={String(m)}
            onValueChange={onMinuteChange}
            disabled={disabled}
          >
            <SelectTrigger className="h-8 w-[84px] px-2 text-xs bg-neutral-900 border-neutral-700 text-neutral-200">
              <SelectValue placeholder="MM" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              {minuteSecondOptions.map((opt) => (
                <SelectItem key={opt} value={String(opt)}>
                  {opt.toString().padStart(2, "0")} m
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Seconds */}
          <Select
            value={String(s)}
            onValueChange={onSecondChange}
            disabled={disabled}
          >
            <SelectTrigger className="h-8 w-[84px] px-2 text-xs bg-neutral-900 border-neutral-700 text-neutral-200">
              <SelectValue placeholder="SS" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              {minuteSecondOptions.map((opt) => (
                <SelectItem key={opt} value={String(opt)}>
                  {opt.toString().padStart(2, "0")} s
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-center text-xs text-neutral-400">
        Current: {formatTime(duration)}{" "}
        <span className="text-neutral-500">
          (max {formatTime(MAX_SECONDS)})
        </span>
      </div>
    </div>
  );
}
