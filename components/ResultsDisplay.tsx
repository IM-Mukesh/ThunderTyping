"use client";
import React, { useMemo } from "react";
import {
  Trophy,
  Award,
  TrendingUp,
  Target,
  Zap,
  RotateCcw,
} from "lucide-react";
import { Check, X } from "lucide-react";
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
  onRetry?: () => void;
  onNewTest?: () => void;
}

function getPerformanceRating(
  wpm: number,
  accuracy: number
): {
  rating: string;
  color: string;
  description: string;
  icon: React.ComponentType<any>;
} {
  const accuracyPercent = accuracy * 100;
  if (wpm >= 80 && accuracyPercent >= 95) {
    return {
      rating: "Exceptional",
      color: "text-yellow-400",
      description: "Outstanding performance! You're in the top tier.",
      icon: Trophy,
    };
  } else if (wpm >= 60 && accuracyPercent >= 90) {
    return {
      rating: "Excellent",
      color: "text-emerald-400",
      description: "Great typing skills! Well above average.",
      icon: Award,
    };
  } else if (wpm >= 40 && accuracyPercent >= 85) {
    return {
      rating: "Good",
      color: "text-blue-400",
      description: "Solid performance. Keep practicing!",
      icon: TrendingUp,
    };
  } else if (wpm >= 20 && accuracyPercent >= 75) {
    return {
      rating: "Fair",
      color: "text-orange-400",
      description: "You're getting there. Focus on accuracy.",
      icon: Target,
    };
  } else {
    return {
      rating: "Needs Practice",
      color: "text-red-400",
      description: "Keep practicing - you'll improve with time!",
      icon: Zap,
    };
  }
}

function formatDuration(d: number) {
  if (d >= 60) return `${Math.floor(d / 60)}m ${d % 60}s`;
  return `${d}s`;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = React.memo((props) => {
  const {
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
  } = props;

  const incorrectChars = useMemo(
    () => Math.max(0, totalChars - correctChars),
    [totalChars, correctChars]
  );
  const durationText = useMemo(() => formatDuration(duration), [duration]);
  const wordAccuracy = useMemo(
    () => (totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 0),
    [correctWords, totalWords]
  );
  const performance = useMemo(
    () => getPerformanceRating(netWpm, accuracy),
    [netWpm, accuracy]
  );
  const PerformanceIcon: React.ComponentType<any> = performance.icon;

  return (
    // outer wrapper — keeps component centered but does not force the page height (so header/footer unaffected)
    <div className="flex items-center justify-center px-4 py-6">
      {/* Card container: capped width so large monitors don't create huge whitespace.
          On mobile the card height is locked to 60vh so it stays visually compact. */}
      <div
        className="
          w-full
          max-w-[760px]       /* laptop/desktop: cap width */
          sm:max-w-[640px]
          md:max-w-[720px]
          bg-transparent
          "
      >
        <div
          className="
            mx-auto
            w-full
            h-[60vh] sm:h-[60vh] md:h-auto
            max-h-[80vh]
            bg-neutral-900/85
            border border-neutral-700/30
            rounded-2xl
            p-4 sm:p-6 md:p-8
            shadow-lg
            flex flex-col justify-between
          "
          style={{ minHeight: 320 }}
        >
          {/* Main area: WPM + rating + description */}
          <div className="w-full text-center">
            <div className="inline-flex flex-col items-center justify-center">
              {/* WPM number scales across breakpoints */}
              <div className="font-extrabold text-[2.25rem] sm:text-[3rem] md:text-[3.75rem] leading-tight text-cyan-400">
                {netWpm}
                <span className="text-base sm:text-lg md:text-xl font-semibold text-cyan-400 ml-2">
                  WPM
                </span>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <PerformanceIcon
                  className={`w-4 h-4 ${performance.color}`}
                  aria-hidden
                />
                <div
                  className={`text-xs sm:text-sm md:text-base font-medium ${performance.color}`}
                >
                  {performance.rating}
                </div>
              </div>

              <p className="mt-2 text-[11px] sm:text-sm md:text-base text-neutral-300 max-w-[44ch] mx-auto">
                {performance.description}
              </p>
            </div>
          </div>

          {/* Top stats grid:
              - mobile: 2 cols for compactness
              - md/laptop: 3 cols (gross, accuracy, characters)
              Each stat box is centered and uses smaller paddings on mobile. */}
          <div className="mt-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {/* Gross */}
              <div className="bg-neutral-800/50 rounded-lg p-2 sm:p-3 border border-neutral-700/30 flex flex-col items-center justify-center min-h-[56px]">
                <div className="text-neutral-400 text-[10px] sm:text-xs uppercase tracking-wider text-center">
                  Gross WPM
                </div>
                <div className="text-lg sm:text-xl font-bold text-white mt-1">
                  {grossWpm}
                </div>
              </div>

              {/* Accuracy */}
              <div className="bg-neutral-800/50 rounded-lg p-2 sm:p-3 border border-neutral-700/30 flex flex-col items-center justify-center min-h-[56px]">
                <div className="text-neutral-400 text-[10px] sm:text-xs uppercase tracking-wider text-center">
                  Accuracy
                </div>
                <div className="text-lg sm:text-xl font-bold text-white mt-1">
                  {Math.round(accuracy * 100)}%
                </div>
                <div className="text-[10px] sm:text-xs text-neutral-500 mt-1">
                  {correctKeystrokes}/{totalKeystrokes}
                </div>
              </div>

              {/* Characters (spans 2 cols on small screens to avoid cramped look) */}
              <div className="col-span-2 md:col-span-1 bg-neutral-800/50 rounded-lg p-2 sm:p-3 border border-neutral-700/30 flex flex-col items-center justify-center min-h-[56px]">
                <div className="text-neutral-400 text-[10px] sm:text-xs uppercase tracking-wider text-center">
                  Characters
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <div className="text-sm sm:text-base font-bold text-white">
                      {correctChars}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <X className="w-4 h-4 text-red-400" />
                    <div className="text-sm sm:text-base font-bold text-white">
                      {incorrectChars}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] sm:text-xs text-neutral-500 mt-1">
                  Word accuracy: {wordAccuracy}%
                </div>
              </div>
            </div>
          </div>

          {/* Bottom small stats row: three compact boxes centered content */}
          <div className="mt-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-neutral-800/30 rounded-lg p-2 sm:p-3 flex flex-col items-center justify-center min-h-[48px]">
                <div className="text-neutral-400 text-[9px] sm:text-[10px] uppercase tracking-wider">
                  Correct
                </div>
                <div className="text-base sm:text-lg font-bold text-white mt-1">
                  {correctWords}
                </div>
              </div>

              <div className="bg-neutral-800/30 rounded-lg p-2 sm:p-3 flex flex-col items-center justify-center min-h-[48px]">
                <div className="text-neutral-400 text-[9px] sm:text-[10px] uppercase tracking-wider">
                  Total
                </div>
                <div className="text-base sm:text-lg font-bold text-white mt-1">
                  {totalWords}
                </div>
              </div>

              <div className="bg-neutral-800/30 rounded-lg p-2 sm:p-3 flex flex-col items-center justify-center min-h-[48px]">
                <div className="text-neutral-400 text-[9px] sm:text-[10px] uppercase tracking-wider">
                  Backspaces
                </div>
                <div className="text-base sm:text-lg font-bold text-white mt-1">
                  {backspaceCount}
                </div>
              </div>
            </div>
          </div>

          {/* Footer: duration + retry icon (kept small and centered; safe to place here) */}
          <div className="w-full mt-3 flex flex-col items-center justify-center">
            <p className="text-neutral-500 text-[10px] sm:text-xs mb-2">
              Duration: {durationText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ResultsDisplay;
