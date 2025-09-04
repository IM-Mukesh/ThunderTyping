"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { TimeSelector } from "./time-selector";
import { TimerDisplay } from "./timer-display";
import { WordDisplay } from "./word-display";
import { ResultsDisplay } from "./results-display";
import { generateWords } from "@/lib/word-generator";

interface TypingTestProps {
  duration: number;
  onDurationChange: (duration: number) => void;
}

interface KeystrokeEvent {
  char: string;
  correct: boolean;
  timestamp: number;
}

export function TypingTest({ duration, onDurationChange }: TypingTestProps) {
  // Test state
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  // Word and input state
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [completedInputs, setCompletedInputs] = useState<string[]>([]);
  const [keystrokes, setKeystrokes] = useState<KeystrokeEvent[]>([]);
  const [hasTypedInCurrentWord, setHasTypedInCurrentWord] = useState(false);

  // Refs to avoid stale closures
  const wordsRef = useRef(words);
  const currentInputRef = useRef(currentInput);
  const currentWordIndexRef = useRef(currentWordIndex);
  const isStartedRef = useRef(isStarted);
  const isFinishedRef = useRef(isFinished);
  const hasTypedRef = useRef(hasTypedInCurrentWord);
  const keystrokesRef = useRef(keystrokes);

  // Hidden input ref
  const inputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<number | null>(null);

  // Initialize words after mount to prevent hydration mismatch
  useEffect(() => {
    setWords(generateWords(500));
    setMounted(true);
  }, []);

  // Keep refs updated
  useEffect(() => {
    wordsRef.current = words;
  }, [words]);

  useEffect(() => {
    currentInputRef.current = currentInput;
  }, [currentInput]);

  useEffect(() => {
    currentWordIndexRef.current = currentWordIndex;
  }, [currentWordIndex]);

  useEffect(() => {
    isStartedRef.current = isStarted;
  }, [isStarted]);

  useEffect(() => {
    isFinishedRef.current = isFinished;
  }, [isFinished]);

  useEffect(() => {
    hasTypedRef.current = hasTypedInCurrentWord;
  }, [hasTypedInCurrentWord]);

  useEffect(() => {
    keystrokesRef.current = keystrokes;
  }, [keystrokes]);

  // Update timeLeft when duration changes (only if not started)
  useEffect(() => {
    if (!isStarted) {
      setTimeLeft(duration);
    }
  }, [duration, isStarted]);

  // Timer logic
  useEffect(() => {
    if (isStarted && !isFinished && startTime) {
      timerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, duration - elapsed);
        setTimeLeft(remaining);

        if (remaining <= 0) {
          setIsFinished(true);
          isFinishedRef.current = true;
          setIsStarted(false);
          isStartedRef.current = false;
        }
      }, 100);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isStarted, isFinished, startTime, duration]);

  // Infinite word generation
  useEffect(() => {
    if (currentWordIndex > words.length - 100) {
      const moreWords = generateWords(500);
      setWords((prev) => {
        // Keep last 200 words to avoid memory issues
        const keepFrom = Math.max(0, prev.length - 200);
        const trimmed = prev.slice(keepFrom);
        const merged = [...trimmed, ...moreWords];
        wordsRef.current = merged;

        // Adjust current word index if we trimmed words
        if (keepFrom > 0) {
          const adjustment = keepFrom;
          setCurrentWordIndex((curr) => Math.max(0, curr - adjustment));
          setCompletedInputs((prev) => prev.slice(adjustment));
        }

        return merged;
      });
    }
  }, [currentWordIndex, words.length]);

  // Helper: process any key
  const processKey = (key: string) => {
    if (isFinishedRef.current) return;

    // Ignore modifier-only keys
    if (["Shift", "Alt", "Control", "Meta"].includes(key)) return;

    // Start test on first keystroke
    if (!isStartedRef.current) {
      setIsStarted(true);
      isStartedRef.current = true;
      setStartTime(Date.now());
    }

    const wordsLocal = wordsRef.current;
    const idx = currentWordIndexRef.current;
    const currentWord = wordsLocal[idx];
    if (!currentWord) return;

    // Backspace
    if (key === "Backspace") {
      if (currentInputRef.current.length > 0) {
        setCurrentInput((prev) => {
          const newVal = prev.slice(0, -1);
          currentInputRef.current = newVal;
          if (newVal.length === 0) {
            setHasTypedInCurrentWord(false);
            hasTypedRef.current = false;
          }
          return newVal;
        });

        setKeystrokes((prev) => {
          const newPrev = prev.slice(0, -1);
          keystrokesRef.current = newPrev;
          return newPrev;
        });
      }
      return;
    }

    // Space: commit current word
    if (key === " ") {
      if (!hasTypedRef.current) {
        return; // Prevent empty submissions
      }

      // Store typed input
      setCompletedInputs((prev) => {
        const next = [...prev];
        next[currentWordIndexRef.current] = currentInputRef.current;
        return next;
      });

      // Move to next word
      setCurrentWordIndex((prev) => {
        const newIdx = prev + 1;
        currentWordIndexRef.current = newIdx;
        return newIdx;
      });

      // Clear current input
      setCurrentInput("");
      currentInputRef.current = "";
      setHasTypedInCurrentWord(false);
      hasTypedRef.current = false;
      return;
    }

    // Regular character input
    if (key.length === 1 && !/[\x00-\x1F]/.test(key)) {
      // Append char to current input
      setCurrentInput((prev) => {
        const newVal = prev + key;
        currentInputRef.current = newVal;
        return newVal;
      });

      if (!hasTypedRef.current) {
        setHasTypedInCurrentWord(true);
        hasTypedRef.current = true;
      }

      // Compute correctness (case-insensitive)
      const charIndex = currentInputRef.current.length - 1;
      const expectedChar = currentWord[charIndex] ?? "";
      const isCorrect = key.toLowerCase() === expectedChar.toLowerCase();

      setKeystrokes((prev) => {
        const next = [
          ...prev,
          {
            char: key,
            correct: isCorrect,
            timestamp: Date.now(),
          },
        ];
        keystrokesRef.current = next;
        return next;
      });
    }
  };

  // Global keydown listener
  useEffect(() => {
    if (!mounted) return;

    const onWindowKey = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null;
      if (
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.tagName === "SELECT" ||
          active.isContentEditable)
      ) {
        return; // User is in a control
      }
      processKey(e.key);
    };

    window.addEventListener("keydown", onWindowKey);
    return () => window.removeEventListener("keydown", onWindowKey);
  }, [mounted]);

  // Input onKeyDown handler
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === " " ||
      e.key === "Backspace" ||
      (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey)
    ) {
      e.preventDefault();
    }
    processKey(e.key);
  };

  // Reset handler
  const handleReset = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsStarted(false);
    isStartedRef.current = false;
    setIsFinished(false);
    isFinishedRef.current = false;
    setTimeLeft(duration);
    setStartTime(null);
    setCurrentWordIndex(0);
    currentWordIndexRef.current = 0;
    setCurrentInput("");
    currentInputRef.current = "";
    setCompletedInputs([]);
    setKeystrokes([]);
    keystrokesRef.current = [];
    setHasTypedInCurrentWord(false);
    hasTypedRef.current = false;
    setWords(generateWords(500));

    // Focus hidden input
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleNewTest = () => {
    handleReset();
  };

  // Focus handler
  const handleWrapperClick = (e?: React.MouseEvent) => {
    const target = (e?.target as HTMLElement) || document.activeElement;
    if (
      target &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        (target as HTMLElement).isContentEditable)
    ) {
      return;
    }
    inputRef.current?.focus();
  };

  // Results calculation
  const results = useMemo(() => {
    const correctChars = keystrokes.filter((k) => k.correct).length;
    const totalChars = keystrokes.length;
    const accuracy = totalChars > 0 ? correctChars / totalChars : 0;

    let minutes = duration / 60;
    if (isFinished) {
      minutes = duration / 60;
    } else if (startTime) {
      const elapsedMs = Date.now() - startTime;
      minutes = Math.max(elapsedMs / 60000, 1 / 60);
    }

    const wpm = minutes > 0 ? Math.round(correctChars / 5 / minutes) : 0;

    return {
      wpm,
      accuracy,
      correctChars,
      totalChars,
    };
  }, [keystrokes, duration, startTime, isFinished]);

  // Don't render until mounted to prevent hydration issues
  if (!mounted || words.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-neutral-400">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center p-6 space-y-8"
      onClick={handleWrapperClick}
    >
      {/* Timer */}
      <TimerDisplay timeLeft={timeLeft} isActive={isStarted && !isFinished} />

      {/* Time Selector */}
      {!isStarted && !isFinished && (
        <TimeSelector duration={duration} onDurationChange={onDurationChange} />
      )}

      {/* Word Display */}
      <div className="w-full">
        <WordDisplay
          words={words}
          currentWordIndex={currentWordIndex}
          currentInput={currentInput}
          completedInputs={completedInputs}
          isStarted={isStarted}
        />
      </div>

      {/* Hidden input */}
      <input
        ref={inputRef}
        className="sr-only"
        value={currentInput}
        onChange={() => {}}
        onKeyDown={handleInputKeyDown}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="Typing input"
      />

      {/* Instructions */}
      {!isStarted && (
        <div className="text-center text-neutral-400 text-sm">
          <p>Click anywhere (or press any key) to start typing</p>
        </div>
      )}

      {/* Results Modal */}
      {isFinished && (
        <ResultsDisplay
          wpm={results.wpm}
          accuracy={results.accuracy}
          correctChars={results.correctChars}
          totalChars={results.totalChars}
          duration={duration}
          onRetry={handleReset}
          onNewTest={handleNewTest}
        />
      )}
    </div>
  );
}
