"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTypingEngine } from "@/hooks/useTypingEngine";
import TimerDisplay from "./TimerDisplay";
import TimeSelector from "./TimeSelector";
import WordDisplay from "./WordDisplay";
import ResultsDisplay from "./ResultsDisplay";

interface TypingTestProps {
  duration: number;
  onDurationChange: (duration: number) => void;
}

export default function TypingTest({
  duration,
  onDurationChange,
}: TypingTestProps) {
  const engine = useTypingEngine(duration);

  const {
    isStarted,
    isFinished,
    timeLeft,
    words,
    currentWordIndex,
    currentInput,
    completedInputs,
    results,
    processKey,
    handleInputKeyDown,
    resetTest,
    newTest,
  } = engine;

  const [showResults, setShowResults] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const cleanupRef = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    cleanupRef.current = false;
    const t = setTimeout(() => {
      if (!cleanupRef.current) {
        inputRef.current?.focus();
      }
    }, 0);
    return () => {
      cleanupRef.current = true;
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    if (isFinished && !showResults) {
      setIsScrolling(true);
      setShowResults(true);
      setIsScrolling(false);
    }
  }, [isFinished, showResults]);

  const handleRetry = useCallback(() => {
    setShowResults(false);
    resetTest();
    setTimeout(() => {
      if (!cleanupRef.current) {
        inputRef.current?.focus();
      }
    }, 100);
  }, [resetTest]);

  const handleNewTest = useCallback(() => {
    setShowResults(false);
    newTest();
    setTimeout(() => {
      if (!cleanupRef.current) {
        inputRef.current?.focus();
      }
    }, 100);
  }, [newTest]);

  const onWindowKey = useCallback(
    (e: KeyboardEvent) => {
      if (showResults || isScrolling) return;
      const active = document.activeElement as HTMLElement | null;
      if (
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.tagName === "SELECT" ||
          active.isContentEditable)
      ) {
        return;
      }
      processKey(e.key);
    },
    [processKey, showResults, isScrolling]
  );

  // Global key listener forwarding to engine
  useEffect(() => {
    window.addEventListener("keydown", onWindowKey);
    return () => window.removeEventListener("keydown", onWindowKey);
  }, [onWindowKey]);

  useEffect(() => {
    if (isScrolling) return;

    let tabPressed = false;
    let enterPressed = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        tabPressed = true;
        e.preventDefault();
      }
      if (e.key === "Enter") {
        enterPressed = true;
      }

      if (tabPressed && enterPressed) {
        e.preventDefault();
        if (showResults) {
          handleRetry();
        } else {
          resetTest();
        }
        tabPressed = false;
        enterPressed = false;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        tabPressed = false;
      }
      if (e.key === "Enter") {
        enterPressed = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [resetTest, showResults, isScrolling, handleRetry]);

  const handleWrapperClick = useCallback(() => {
    if (showResults || isScrolling) return;
    inputRef.current?.focus();
  }, [showResults, isScrolling]);

  if (!words || words.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-neutral-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl px-6 space-y-8 relative overflow-hidden">
      <motion.div
        className="relative w-full"
        animate={{
          y: showResults ? "-100vh" : "0vh",
        }}
        transition={{
          type: "spring",
          stiffness: 80,
          damping: 20,
          duration: 1.2,
        }}
      >
        <AnimatePresence mode="wait">
          {!showResults && (
            <motion.div
              key="typing-area"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              ref={containerRef}
              className="mx-auto max-w-4xl p-8 rounded-2xl bg-neutral-900/95 border border-neutral-700/60 shadow-2xl backdrop-blur-sm"
              onClick={handleWrapperClick}
            >
              {/* Header / Title (centered) */}
              <div className="w-full flex items-center justify-center pt-8">
                <h1
                  className="text-4xl font-bold text-white"
                  style={{
                    background: "linear-gradient(90deg, #22d3ee, #60a5fa)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  ThunderTyping
                </h1>
              </div>

              {/* Timer */}
              <div className="mt-6 flex items-center justify-center">
                <TimerDisplay
                  timeLeft={timeLeft}
                  isActive={isStarted && !isFinished}
                />
              </div>

              {/* Time selector */}
              <div className="flex items-center justify-center">
                <div className="h-[72px] w-full flex items-center justify-center">
                  <TimeSelector
                    duration={duration}
                    onDurationChange={onDurationChange}
                    disabled={isStarted || isFinished}
                  />
                </div>
              </div>

              {/* Word area */}
              <div className="mt-6 w-full">
                <WordDisplay
                  words={words}
                  currentWordIndex={currentWordIndex}
                  currentInput={currentInput}
                  completedInputs={completedInputs}
                  visibleLines={3}
                />
              </div>

              {/* Hidden input with improved accessibility */}
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
                aria-label="Typing input for speed test"
                aria-describedby="typing-instructions"
                role="textbox"
              />

              {/* Instructions with proper ID for accessibility */}
              <div className="mt-6 pb-2 flex items-center justify-center">
                <div
                  id="typing-instructions"
                  className={`text-center text-neutral-400 text-sm transition-opacity duration-300 ${
                    isStarted ? "invisible" : "visible"
                  }`}
                >
                  Press any key to begin typing test
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showResults && (
          <motion.div
            key="results-area"
            initial={{ opacity: 0, y: "100vh" }}
            animate={{ opacity: 1, y: "0vh" }}
            exit={{ opacity: 0, y: "100vh" }}
            transition={{
              type: "spring",
              stiffness: 80,
              damping: 20,
              duration: 1.2,
            }}
            className="fixed inset-0 flex items-center justify-center bg-black/95 backdrop-blur-sm z-50"
          >
            <div className="w-full max-w-4xl mx-auto px-6">
              <ResultsDisplay
                grossWpm={results.grossWpm}
                netWpm={results.netWpm}
                accuracy={results.accuracy}
                correctChars={results.correctChars}
                totalChars={results.totalChars}
                correctWords={results.correctWords}
                totalWords={results.totalWords}
                totalKeystrokes={results.totalKeystrokes}
                correctKeystrokes={results.correctKeystrokes}
                backspaceCount={results.backspaceCount}
                duration={duration}
                onRetry={handleRetry}
                onNewTest={handleNewTest}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab+Enter hint - always visible at bottom of screen */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 backdrop-blur-md px-4 py-2 rounded-full">
          <span className="font-mono text-slate-300">tab</span>
          <span className="text-slate-500">+</span>
          <span className="font-mono text-slate-300">enter</span>
          <span className="text-slate-500">-</span>
          <span className="text-slate-300">
            {showResults ? "retry test" : "restart test"}
          </span>
        </div>
      </div>
    </div>
  );
}
