"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTypingEngine } from "./useTypingEngine";
import TimerDisplay from "./TimerDisplay";
import TimeSelector from "./TimeSelector";
import WordDisplay from "./WordDisplay";
import ResultsModal from "./ResultsModal";

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

  const [showModal, setShowModal] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (isFinished) setShowModal(true);
  }, [isFinished]);

  const handleCloseModal = () => {
    setShowModal(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleRetry = () => {
    resetTest();
    setShowModal(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleNewTest = () => {
    newTest();
    setShowModal(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // Global key listener forwarding to engine, unless modal open or focus in a real input
  useEffect(() => {
    const onWindowKey = (e: KeyboardEvent) => {
      if (showModal) return;
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
    };
    window.addEventListener("keydown", onWindowKey);
    return () => window.removeEventListener("keydown", onWindowKey);
  }, [processKey, showModal]);

  const handleWrapperClick = () => {
    if (showModal) return;
    inputRef.current?.focus();
  };

  if (!words || words.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-neutral-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl px-6">
      <div
        className="mx-auto max-w-4xl p-10 rounded-2xl bg-neutral-900 border border-neutral-800/50 shadow-sm"
        style={{ minHeight: 420 }}
        onClick={handleWrapperClick}
      >
        {/* Header / Title (centered) */}
        <div className="w-full flex items-center justify-center">
          <h1
            className="text-4xl font-bold"
            style={{
              background: "linear-gradient(90deg,#06b6d4,#3b82f6)",
              WebkitBackgroundClip: "text",
              color: "transparent",
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
        <div className="mt-2 flex items-center justify-center">
          <div className="h-[72px] w-full flex items-center justify-center">
            <TimeSelector
              duration={duration}
              onDurationChange={onDurationChange}
              disabled={isStarted || isFinished}
            />
          </div>
        </div>

        {/* Word area */}
        <div className="mt-4 w-full">
          <WordDisplay
            words={words}
            currentWordIndex={currentWordIndex}
            currentInput={currentInput}
            completedInputs={completedInputs}
            visibleLines={3}
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
        <div className="mt-6 flex items-center justify-center">
          {!isStarted && (
            <div className="text-center text-neutral-400 text-sm">
              Click anywhere to focus and press any key to start typing
            </div>
          )}
        </div>
      </div>

      {/* Modal with updated props */}
      <ResultsModal
        open={showModal}
        onClose={handleCloseModal}
        onRetry={handleRetry}
        onNewTest={handleNewTest}
        grossWpm={results.grossWpm}
        netWpm={results.netWpm}
        accuracy={results.accuracy}
        correctChars={results.correctChars}
        totalChars={results.totalChars}
        correctWords={results.correctWords}
        totalWords={results.totalWords}
        duration={duration}
      />
    </div>
  );
}
