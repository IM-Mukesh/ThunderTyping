"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTypingEngine } from "@/hooks/useTypingEngine";
import TimerDisplay from "./TimerDisplay";
import TimeSelector from "./TimeSelector";
import WordDisplay from "./WordDisplay";
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

  // Refs used across renders — keep them declared before any early return
  const inputRef = useRef<HTMLInputElement | null>(null);
  const cleanupRef = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Track whether we're in IME/composition mode (avoid double-processing)
  const isComposingRef = useRef(false);

  /**
   * MOBILE / SOFT-KEYBOARD SUPPORT
   *
   * Many mobile keyboards don't reliably fire keydown events. The input needs to
   * handle onChange / composition to work reliably on soft keyboards.
   *
   * We declare these callbacks and composition handlers BEFORE the early return
   * so hooks order stays stable across renders.
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isComposingRef.current) {
        // ignore intermediate composition text
        return;
      }

      const newVal = e.target.value ?? "";
      const prevVal = currentInput ?? "";

      if (newVal.length > prevVal.length) {
        const added = newVal.slice(prevVal.length);
        for (const ch of added) {
          processKey(ch);
        }
      } else if (newVal.length < prevVal.length) {
        const removedCount = prevVal.length - newVal.length;
        for (let i = 0; i < removedCount; i++) {
          processKey("Backspace");
        }
      }
      // engine controls currentInput; we do not set local input state here
    },
    [currentInput, processKey]
  );

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(
    (e: React.CompositionEvent<HTMLInputElement>) => {
      isComposingRef.current = false;
      const newVal = (e.target as HTMLInputElement).value ?? "";
      const prevVal = currentInput ?? "";

      if (newVal.length > prevVal.length) {
        const added = newVal.slice(prevVal.length);
        for (const ch of added) {
          processKey(ch);
        }
      } else if (newVal.length < prevVal.length) {
        const removedCount = prevVal.length - newVal.length;
        for (let i = 0; i < removedCount; i++) {
          processKey("Backspace");
        }
      }
    },
    [currentInput, processKey]
  );

  // Focus input after mount/hydration
  useEffect(() => {
    cleanupRef.current = false;
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

  // Ensure layout measurements run after paint and after fonts load
  useEffect(() => {
    requestAnimationFrame(() => {
      try {
        window.dispatchEvent(new Event("resize"));
      } catch {}
    });

    try {
      (document as any).fonts?.ready
        ?.then(() => {
          try {
            window.dispatchEvent(new Event("resize"));
          } catch {}
        })
        .catch(() => {});
    } catch {}
    // run once
  }, []);

  useEffect(() => {
    if (isFinished && !showResults) {
      setShowResults(true);
    }
  }, [isFinished, showResults]);

  const handleRetry = useCallback(() => {
    setShowResults(false);
    resetTest();
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
    // user gesture — focus the hidden input so mobile keyboard appears
    inputRef.current?.focus?.();
  }, [showResults, isScrolling]);

  // --- Early return for loading: only after all hooks are declared above ---
  if (!words || words.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[360px]">
        <ThunderLoader />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 relative">
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
        className="mx-auto w-full mt-12 2xl:mt-[100px]"
        animate={{ y: showResults ? "-20vh" : "0px" }}
        transition={{
          type: "spring",
          stiffness: 80,
          damping: 20,
          duration: 0.9,
        }}
        style={{ willChange: "transform, opacity" }}
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
              className="mx-auto w-full min-w-0 rounded-2xl bg-neutral-900/95 border border-neutral-700/60 shadow-2xl backdrop-blur-sm 
                         px-3 sm:px-4 md:px-6 lg:px-8 py-3 md:py-8"
              style={{ minHeight: 180, willChange: "transform, opacity" }}
            >
              <div className="w-full">
                <WordDisplay
                  words={words}
                  currentWordIndex={currentWordIndex}
                  currentInput={currentInput}
                  completedInputs={completedInputs}
                  visibleLines={3}
                />
              </div>

              <input
                ref={inputRef}
                className="sr-only"
                value={currentInput}
                // handle soft keyboard input via onChange
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-label="Typing input for speed test"
                aria-describedby="typing-instructions"
                role="textbox"
              />

              {/* <div className="mt-6 pb-2 flex items-center justify-center">
                <div
                  id="typing-instructions"
                  className={`text-center text-neutral-400 text-sm transition-opacity duration-300 ${
                    isStarted ? "invisible" : "visible"
                  }`}
                >
                  Press any key to begin typing test
                </div>
              </div> */}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Results overlay (now respects footer height so footer remains visible) */}
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
            // Do not use inset-0 here — keep footer visible using bottom var
            className="fixed left-0 right-0 top-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-40"
            style={{
              bottom: "var(--footer-height, 48px)",
              willChange: "transform, opacity",
            }}
          >
            <div className="w-full max-w-6xl mx-auto px-6 mt-6">
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

      {/* Single global KeyboardHint for this page only */}
      <KeyboardHint
        label={showResults ? "Retry Test" : "Restart Test"}
        onRestart={showResults ? handleRetry : resetTest}
      />
    </div>
  );
}
