"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTypingEngine } from "@/hooks/useTypingEngine";
import TimerDisplay from "./TimerDisplay";
import TimeSelector from "./TimeSelector";
import WordDisplay from "./WordDisplay";
// import ResultsDisplay from "./ResultsDisplay";
import dynamic from "next/dynamic";
const ResultsDisplay = dynamic(() => import("./ResultsDisplay"), {
  ssr: false,
  loading: () => (
    <div aria-hidden className="min-h-[200px] flex items-center justify-center">
      <div className="w-12 h-12">
        <ThunderLoader size={48} />
      </div>
    </div>
  ),
});
import { ThunderLoader } from "./ThunderLogo";
import KeyboardHint from "@/components/KeyboardHint";

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
    // small delay to ensure hydration complete; 0ms timeout used intentionally
    const t = setTimeout(() => {
      if (!cleanupRef.current) {
        inputRef.current?.focus?.();
      }
    }, 0);
    return () => {
      cleanupRef.current = true;
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    if (isFinished && !showResults) {
      // avoid layout thrash: set state, let animation handle scroll/focus
      setShowResults(true);
    }
  }, [isFinished, showResults]);

  const handleRetry = useCallback(() => {
    setShowResults(false);
    resetTest();
    // small delay to allow re-render before focusing
    setTimeout(() => {
      if (!cleanupRef.current) {
        inputRef.current?.focus?.();
      }
    }, 100);
  }, [resetTest]);

  const handleNewTest = useCallback(() => {
    setShowResults(false);
    newTest();
    setTimeout(() => {
      if (!cleanupRef.current) {
        inputRef.current?.focus?.();
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
    inputRef.current?.focus?.();
  }, [showResults, isScrolling]);

  if (!words || words.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[360px]">
        <ThunderLoader />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl px-4 space-y-6 relative">
      {/* Timer/Selector area — fixed height so they occupy same space */}
      <div className="w-full flex items-center justify-center">
        <div className="h-16 flex items-center justify-center">
          {!isStarted && !isFinished ? (
            <TimeSelector
              duration={duration}
              onDurationChange={onDurationChange}
              disabled={isStarted || isFinished}
            />
          ) : (
            <TimerDisplay
              timeLeft={timeLeft}
              isActive={isStarted && !isFinished}
            />
          )}
        </div>
      </div>

      {/* The card that contains ONLY the typing words / input / instructions */}
      <motion.div
        className="mx-auto w-full"
        animate={{ y: showResults ? "-20vh" : "0px" }}
        transition={{
          type: "spring",
          stiffness: 80,
          damping: 20,
          duration: 0.9,
        }}
        style={{ willChange: "transform, opacity" }} // hint to browser for animation
      >
        <AnimatePresence mode="wait">
          {!showResults && (
            <motion.div
              key="typing-card"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              ref={containerRef}
              onClick={handleWrapperClick}
              className="mx-auto max-w-4xl rounded-2xl bg-neutral-900/95 border border-neutral-700/60 shadow-2xl backdrop-blur-sm p-8"
              style={{ minHeight: 260, willChange: "transform, opacity" }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-full">
                  <WordDisplay
                    words={words}
                    currentWordIndex={currentWordIndex}
                    currentInput={currentInput}
                    completedInputs={completedInputs}
                    visibleLines={3}
                  />
                </div>
              </div>

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

      {/* Results overlay */}
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
              duration: 1.0,
            }}
            className="fixed inset-0 flex items-center justify-center bg-black/95 backdrop-blur-sm z-40"
            style={{ willChange: "transform, opacity" }}
          >
            <div className="w-full max-w-4xl mx-auto px-6 mt-6">
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

      <KeyboardHint label={showResults ? "retry test" : "restart test"} />
    </div>
  );
}
