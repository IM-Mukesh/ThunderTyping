"use client";
import { Button } from "@/components/ui/button";

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

export function ResultsDisplay({
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
  // Compute incorrect characters and words
  const incorrectChars = Math.max(0, totalChars - correctChars);
  const incorrectWords = Math.max(0, totalWords - correctWords);

  return (
    <div className="w-full max-w-4xl mx-auto p-8 rounded-2xl bg-neutral-900 border border-neutral-800/50 shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Test Complete!</h2>
        <p className="text-neutral-400">
          Duration:{" "}
          {duration >= 60
            ? `${Math.floor(duration / 60)}m ${duration % 60}s`
            : `${duration}s`}
        </p>
      </div>

      {/* Primary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 p-6 text-center">
          <div className="text-sm text-cyan-300 mb-2">Net WPM</div>
          <div className="text-4xl font-mono font-bold text-cyan-400 mb-2">
            {netWpm}
          </div>
          <div className="text-xs text-neutral-400">Gross: {grossWpm} WPM</div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 p-6 text-center">
          <div className="text-sm text-green-300 mb-2">Accuracy</div>
          <div className="text-4xl font-mono font-bold text-green-400 mb-2">
            {Math.round(accuracy * 100)}%
          </div>
          <div className="text-xs text-neutral-400">
            {correctKeystrokes}/{totalKeystrokes} keystrokes
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-6 text-center">
          <div className="text-sm text-purple-300 mb-2">Characters</div>
          <div className="text-2xl font-mono font-semibold">
            <div className="text-green-400">{correctChars} correct</div>
            <div className="text-red-400">{incorrectChars} incorrect</div>
          </div>
        </div>
      </div>

      {/* Detailed statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-neutral-700 pb-2">
            Character Stats
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400">Total characters</span>
              <span className="font-mono text-white">{totalChars}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400">Correct characters</span>
              <span className="font-mono text-green-400">{correctChars}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400">Incorrect characters</span>
              <span className="font-mono text-red-400">{incorrectChars}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400">Backspaces used</span>
              <span className="font-mono text-yellow-400">
                {backspaceCount}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-neutral-700 pb-2">
            Word Stats
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400">Words completed</span>
              <span className="font-mono text-white">{totalWords}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400">Correct words</span>
              <span className="font-mono text-green-400">{correctWords}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400">Incorrect words</span>
              <span className="font-mono text-red-400">{incorrectWords}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400">Word accuracy</span>
              <span className="font-mono text-cyan-400">
                {totalWords > 0
                  ? Math.round((correctWords / totalWords) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 justify-center">
        <Button
          variant="outline"
          onClick={onRetry}
          className="px-8 py-2 border-neutral-600 hover:border-neutral-500 text-neutral-300 hover:text-white bg-transparent"
        >
          Retry Same Test
        </Button>
        <Button
          onClick={onNewTest}
          className="px-8 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold"
        >
          New Test
        </Button>
      </div>

      {/* Keyboard shortcut hint */}
      <div className="text-center mt-6">
        <div className="text-xs text-neutral-500">
          Tip: Press <span className="font-mono text-neutral-400">Tab</span> +{" "}
          <span className="font-mono text-neutral-400">Enter</span> together to
          retry quickly
        </div>
      </div>
    </div>
  );
}

export default ResultsDisplay;
