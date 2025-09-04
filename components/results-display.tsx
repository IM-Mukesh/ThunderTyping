// src/components/typing/results-display.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface ResultsDisplayProps {
  wpm: number;
  accuracy: number; // 0-1
  correctChars: number;
  totalChars: number;
  duration: number;
  onRetry: () => void;
  onNewTest: () => void;
}

export function ResultsDisplay({
  wpm,
  accuracy,
  correctChars,
  totalChars,
  duration,
  onRetry,
  onNewTest,
}: ResultsDisplayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-lg p-6 text-center">
        <h3 className="text-2xl font-bold text-white mb-2">Results</h3>

        <div className="flex justify-around items-center mb-4">
          <div>
            <div className="text-sm text-neutral-400">WPM</div>
            <div className="text-2xl font-mono font-bold text-cyan-400">
              {wpm}
            </div>
          </div>
          <div>
            <div className="text-sm text-neutral-400">Accuracy</div>
            <div className="text-2xl font-mono font-bold text-green-400">
              {Math.round(accuracy * 100)}%
            </div>
          </div>
          <div>
            <div className="text-sm text-neutral-400">Chars</div>
            <div className="text-2xl font-mono font-bold text-neutral-200">
              {correctChars}/{totalChars}
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={onRetry}>
            Retry
          </Button>
          <Button onClick={onNewTest}>New Test</Button>
        </div>
      </div>
    </div>
  );
}
