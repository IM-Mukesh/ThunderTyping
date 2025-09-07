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

  // Global Tab+Enter restart shortcut
  useEffect(() => {
    if (showModal) return;

    let tabPressed = false;
    let enterPressed = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        tabPressed = true;
        e.preventDefault(); // Prevent default tab behavior
      }
      if (e.key === "Enter") {
        enterPressed = true;
      }

      // If both are pressed, restart the test
      if (tabPressed && enterPressed) {
        e.preventDefault();
        resetTest();
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
  }, [resetTest, showModal]);

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
        <div className=" flex items-center justify-center">
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
              Press any key to begin
            </div>
          )}
        </div>
      </div>

      {/* Tab+Enter hint - always visible at bottom of screen */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 backdrop-blur-md px-4 py-2 rounded-full">
          <span className="font-mono text-slate-300">tab</span>
          <span className="text-slate-500">+</span>
          <span className="font-mono text-slate-300">enter</span>
          <span className="text-slate-500">-</span>
          <span className="text-slate-300">restart test</span>
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
