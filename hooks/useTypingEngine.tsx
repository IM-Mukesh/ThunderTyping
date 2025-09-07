"use client";

import type React from "react";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { generateWords } from "@/lib/word-generator";

/**
 * Enhanced keystroke event that includes word boundary information
 */
export interface KeystrokeEvent {
  char: string;
  correct: boolean;
  timestamp: number;
  isSpace: boolean; // Track spaces separately
  wasBackspaced?: boolean; // Track if this character was later backspaced
  originalPosition?: number; // Track original position in word
}

export interface UseTypingEngineState {
  // status
  isStarted: boolean;
  isFinished: boolean;
  timeLeft: number; // seconds remaining
  startTime: number | null;

  // words & input
  words: string[];
  currentWordIndex: number;
  currentInput: string;
  completedInputs: string[];
  keystrokes: KeystrokeEvent[];
  allKeystrokes: KeystrokeEvent[]; // Track ALL keystrokes including backspaced ones
}

export interface UseTypingEngineResults {
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
}

export interface UseTypingEngineAPI extends UseTypingEngineState {
  results: UseTypingEngineResults;
  processKey: (key: string) => void;
  handleInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  resetTest: () => void;
  newTest: () => void;
  setFinished: (val: boolean) => void;
}

/**
 * Returns true if the key is a "typing" key that should start the timer & test.
 */
function isTypingStarterKey(key: string) {
  if (key.length !== 1) return false;
  if (key === " ") return false;
  return true;
}

function isModifierKey(key: string) {
  return (
    key === "Shift" || key === "Alt" || key === "Control" || key === "Meta"
  );
}

/**
 * Calculate detailed typing statistics following standard rules
 * Updated to properly account for corrections and backspaces
 */
function calculateDetailedResults(
  keystrokes: KeystrokeEvent[],
  allKeystrokes: KeystrokeEvent[],
  completedInputs: string[],
  words: string[],
  currentWordIndex: number,
  currentInput: string,
  duration: number,
  startTime: number | null,
  isFinished: boolean
): UseTypingEngineResults {
  const totalKeystrokes = allKeystrokes.filter(
    (k) => !k.isSpace && k.char !== "Backspace"
  ).length;
  const correctKeystrokes = allKeystrokes.filter(
    (k) => !k.isSpace && k.char !== "Backspace" && k.correct && !k.wasBackspaced
  ).length;
  const backspaceCount = allKeystrokes.filter(
    (k) => k.char === "Backspace"
  ).length;

  // Calculate total characters typed (including spaces) - final state
  let totalCharsTyped = 0;
  let correctCharsTyped = 0;

  // Count characters from completed words
  for (let i = 0; i < Math.min(completedInputs.length, currentWordIndex); i++) {
    const typedWord = completedInputs[i] || "";
    const expectedWord = words[i] || "";

    // Add typed word length
    totalCharsTyped += typedWord.length;

    // Count correct characters in this word
    for (let j = 0; j < Math.min(typedWord.length, expectedWord.length); j++) {
      if (typedWord[j].toLowerCase() === expectedWord[j].toLowerCase()) {
        correctCharsTyped++;
      }
    }

    // Add space after word (except for the last completed word if we're still typing)
    if (
      i < currentWordIndex - 1 ||
      (i === currentWordIndex - 1 && currentWordIndex < words.length)
    ) {
      totalCharsTyped += 1; // space
      correctCharsTyped += 1; // spaces are always "correct" when properly placed
    }
  }

  // Add current word being typed
  if (currentWordIndex < words.length && currentInput.length > 0) {
    const expectedWord = words[currentWordIndex] || "";
    totalCharsTyped += currentInput.length;

    // Count correct characters in current word
    for (
      let j = 0;
      j < Math.min(currentInput.length, expectedWord.length);
      j++
    ) {
      if (currentInput[j].toLowerCase() === expectedWord[j].toLowerCase()) {
        correctCharsTyped++;
      }
    }
  }

  // Calculate time elapsed in minutes
  let minutes = duration / 60;
  if (!isFinished && startTime) {
    const elapsedMs = Date.now() - startTime;
    minutes = Math.max(elapsedMs / 60000, 1 / 60); // Minimum 1 second
  }

  const keystrokeAccuracy =
    totalKeystrokes > 0 ? correctKeystrokes / totalKeystrokes : 0;
  const finalStateAccuracy =
    totalCharsTyped > 0 ? correctCharsTyped / totalCharsTyped : 0;

  // Use the lower of the two for more accurate representation
  const accuracy = Math.min(keystrokeAccuracy, finalStateAccuracy);

  const grossWpm = minutes > 0 ? Math.round(totalCharsTyped / 5 / minutes) : 0;
  const netWpm = Math.round(grossWpm * accuracy);

  // Word-level accuracy
  let correctWords = 0;
  const totalWords = Math.min(completedInputs.length, currentWordIndex);

  for (let i = 0; i < totalWords; i++) {
    const typedWord = completedInputs[i] || "";
    const expectedWord = words[i] || "";
    if (typedWord.toLowerCase() === expectedWord.toLowerCase()) {
      correctWords++;
    }
  }

  return {
    grossWpm,
    netWpm,
    accuracy,
    correctChars: correctCharsTyped,
    totalChars: totalCharsTyped,
    correctWords,
    totalWords,
    totalKeystrokes,
    correctKeystrokes,
    backspaceCount,
  };
}

/**
 * Enhanced typing engine hook with accurate WPM/accuracy calculations
 */
export function useTypingEngine(duration: number): UseTypingEngineAPI {
  // --- Status ---
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [startTime, setStartTime] = useState<number | null>(null);

  // --- Words & input ---
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [completedInputs, setCompletedInputs] = useState<string[]>([]);
  const [keystrokes, setKeystrokes] = useState<KeystrokeEvent[]>([]);
  const [allKeystrokes, setAllKeystrokes] = useState<KeystrokeEvent[]>([]);
  const [mounted, setMounted] = useState(false);
  const [hasTypedInCurrentWord, setHasTypedInCurrentWord] = useState(false);

  // --- Refs to avoid stale closures ---
  const timerRef = useRef<number | null>(null);
  const isActiveRef = useRef<boolean>(false);

  // --- Mount: initialize words ---
  useEffect(() => {
    setWords(generateWords(500));
    setMounted(true);
  }, []);

  // --- Track active state to prevent race conditions ---
  useEffect(() => {
    isActiveRef.current = isStarted && !isFinished;
  }, [isStarted, isFinished]);

  // Update timeLeft if duration changes while NOT started
  useEffect(() => {
    if (!isStarted) setTimeLeft(duration);
  }, [duration, isStarted]);

  // --- Improved timer with proper cleanup and race condition prevention ---
  useEffect(() => {
    // Clear any existing timer first
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (isStarted && !isFinished && startTime) {
      timerRef.current = window.setInterval(() => {
        // Check if component is still active to prevent stale updates
        if (!isActiveRef.current) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return;
        }

        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, duration - elapsed);

        setTimeLeft(remaining);

        if (remaining <= 0) {
          setIsFinished(true);
          setIsStarted(false);
          isActiveRef.current = false;
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
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

  // --- Infinite words generation / trimming ---
  useEffect(() => {
    if (currentWordIndex > words.length - 100) {
      const more = generateWords(500);
      setWords((prev) => {
        const keepFrom = Math.max(0, prev.length - 200);
        const trimmed = prev.slice(keepFrom);
        const merged = [...trimmed, ...more];

        if (keepFrom > 0) {
          const adjust = keepFrom;
          setCurrentWordIndex((curr) => {
            const newIndex = Math.max(0, curr - adjust);
            return newIndex;
          });

          setCompletedInputs((prevInputs) => {
            const newInputs = prevInputs.slice(adjust);
            return newInputs;
          });
        }
        return merged;
      });
    }
  }, [currentWordIndex, words.length]);

  // --- Helpers ---
  const startTestIfTypingKey = useCallback(
    (key: string) => {
      if (isStarted || isFinished) return;
      if (!isTypingStarterKey(key)) return;

      const now = Date.now();
      setIsStarted(true);
      setStartTime(now);
      isActiveRef.current = true;
    },
    [isStarted, isFinished]
  );

  const commitCurrentWord = useCallback(() => {
    if (!hasTypedInCurrentWord) return;

    const currentWordInput = currentInput;
    const currentIndex = currentWordIndex;
    const nextIndex = currentIndex + 1;

    // Update state atomically
    setCompletedInputs((prev) => {
      const next = [...prev];
      while (next.length <= currentIndex) {
        next.push("");
      }
      next[currentIndex] = currentWordInput;
      return next;
    });

    setCurrentWordIndex(nextIndex);
    setCurrentInput("");
    setHasTypedInCurrentWord(false);

    // Add space keystroke
    const spaceKeystroke = {
      char: " ",
      correct: true,
      timestamp: Date.now(),
      isSpace: true,
    };
    setKeystrokes((prev) => [...prev, spaceKeystroke]);
    setAllKeystrokes((prev) => [...prev, spaceKeystroke]);
  }, [currentInput, currentWordIndex, hasTypedInCurrentWord]);

  // --- Improved reset with proper cleanup ---
  const resetTest = useCallback(() => {
    // Clear timer first
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    isActiveRef.current = false;
    setIsStarted(false);
    setIsFinished(false);
    setTimeLeft(duration);
    setStartTime(null);
    setCurrentWordIndex(0);
    setCurrentInput("");
    setCompletedInputs([]);
    setKeystrokes([]);
    setAllKeystrokes([]);
    setHasTypedInCurrentWord(false);
    setWords(generateWords(500));
  }, [duration]);

  const newTest = useCallback(() => {
    resetTest();
  }, [resetTest]);

  const setFinished = useCallback((val: boolean) => {
    setIsFinished(val);
    if (val) {
      isActiveRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, []);

  // --- Main key processor ---
  const processKey = useCallback(
    (key: string) => {
      if (isFinished) return;
      if (isModifierKey(key)) return;

      if (!isStarted) {
        startTestIfTypingKey(key);
        if (!isTypingStarterKey(key)) return;
      }

      const currentWord = words[currentWordIndex];
      if (!currentWord) return;

      if (key === "Backspace") {
        // Track backspace in all keystrokes
        setAllKeystrokes((prev) => [
          ...prev,
          {
            char: "Backspace",
            correct: false,
            timestamp: Date.now(),
            isSpace: false,
          },
        ]);

        if (currentInput.length > 0) {
          // Mark the last keystroke as backspaced
          setAllKeystrokes((prev) => {
            const newKeystrokes = [...prev];
            // Find the last non-backspace keystroke and mark it as backspaced
            for (let i = newKeystrokes.length - 1; i >= 0; i--) {
              if (
                newKeystrokes[i].char !== "Backspace" &&
                !newKeystrokes[i].wasBackspaced
              ) {
                newKeystrokes[i] = { ...newKeystrokes[i], wasBackspaced: true };
                break;
              }
            }
            return newKeystrokes;
          });

          setCurrentInput((prev) => prev.slice(0, -1));
          setKeystrokes((prev) => prev.slice(0, -1));
          if (currentInput.length === 1) {
            setHasTypedInCurrentWord(false);
          }
        }
        return;
      }

      // Space: commit current word
      if (key === " ") {
        commitCurrentWord();
        return;
      }

      // Ignore special keys
      if (key === "Enter" || key === "Tab" || key === "Escape") {
        return;
      }

      // Regular printable character
      if (key.length === 1 && !/[\x00-\x1F]/.test(key)) {
        // Count wrong characters in current input more accurately
        let wrongCharsInCurrentWord = 0;
        const maxWrongChars = 10;

        // Count existing wrong characters
        for (let i = 0; i < currentInput.length; i++) {
          const expectedChar = (currentWord[i] ?? "").toLowerCase();
          const typedChar = currentInput[i].toLowerCase();
          if (typedChar !== expectedChar) {
            wrongCharsInCurrentWord++;
          }
        }

        // Check if this new character would be wrong
        const charIndex = currentInput.length;
        const expectedChar = currentWord[charIndex] ?? "";
        const isCorrect = key === expectedChar; // Remove toLowerCase() for case-sensitive comparison

        // Strict limit: if we already have max wrong chars and this would be wrong, block it
        if (!isCorrect && wrongCharsInCurrentWord >= maxWrongChars) {
          console.log(
            "[v0] Blocked character - already at limit:",
            wrongCharsInCurrentWord
          );
          return;
        }

        // Also block if we're typing beyond the word length and already have wrong chars
        if (
          charIndex >= currentWord.length &&
          wrongCharsInCurrentWord >= maxWrongChars
        ) {
          console.log(
            "[v0] Blocked extra character - at word end with wrong chars:",
            wrongCharsInCurrentWord
          );
          return;
        }

        const newInput = currentInput + key;

        setCurrentInput(newInput);

        if (!hasTypedInCurrentWord) {
          setHasTypedInCurrentWord(true);
        }

        const keystroke = {
          char: key,
          correct: isCorrect,
          timestamp: Date.now(),
          isSpace: false,
          originalPosition: charIndex,
        };

        setKeystrokes((prev) => [...prev, keystroke]);
        setAllKeystrokes((prev) => [...prev, keystroke]);
      }
    },
    [
      isFinished,
      isStarted,
      words,
      currentWordIndex,
      currentInput,
      hasTypedInCurrentWord,
      commitCurrentWord,
      startTestIfTypingKey,
    ]
  );

  // --- Input handler ---
  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (
        e.key === " " ||
        e.key === "Backspace" ||
        e.key === "Enter" ||
        e.key === "Tab" ||
        (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey)
      ) {
        e.preventDefault();
      }
      processKey(e.key);
    },
    [processKey]
  );

  // --- Results computation using the new detailed calculation ---
  const results: UseTypingEngineResults = useMemo(() => {
    return calculateDetailedResults(
      keystrokes,
      allKeystrokes,
      completedInputs,
      words,
      currentWordIndex,
      currentInput,
      duration,
      startTime,
      isFinished
    );
  }, [
    keystrokes,
    allKeystrokes,
    completedInputs,
    words,
    currentWordIndex,
    currentInput,
    duration,
    startTime,
    isFinished,
  ]);

  return {
    // state
    isStarted,
    isFinished,
    timeLeft,
    startTime,
    words,
    currentWordIndex,
    currentInput,
    completedInputs,
    keystrokes,
    allKeystrokes,

    // computed
    results,

    // actions
    processKey,
    handleInputKeyDown,
    resetTest,
    newTest,
    setFinished,
  };
}
