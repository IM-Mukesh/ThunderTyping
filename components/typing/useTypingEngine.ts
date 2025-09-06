"use client";

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
}

export interface UseTypingEngineResults {
  grossWpm: number;
  netWpm: number;
  accuracy: number; // 0..1
  correctChars: number;
  totalChars: number;
  correctWords: number;
  totalWords: number;
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
 */
function calculateDetailedResults(
  keystrokes: KeystrokeEvent[],
  completedInputs: string[],
  words: string[],
  currentWordIndex: number,
  currentInput: string,
  duration: number,
  startTime: number | null,
  isFinished: boolean
): UseTypingEngineResults {
  // Calculate total characters typed (including spaces)
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

  // Standard WPM calculations
  const accuracy =
    totalCharsTyped > 0 ? correctCharsTyped / totalCharsTyped : 0;
  const grossWpm = minutes > 0 ? Math.round(totalCharsTyped / 5 / minutes) : 0;
  const netWpm = Math.round(grossWpm * accuracy);

  // Word-level accuracy
  let correctWords = 0;
  let totalWords = Math.min(completedInputs.length, currentWordIndex);

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
  const [mounted, setMounted] = useState(false);
  const [hasTypedInCurrentWord, setHasTypedInCurrentWord] = useState(false);

  // --- Refs to avoid stale closures ---
  const isStartedRef = useRef(isStarted);
  const isFinishedRef = useRef(isFinished);
  const currentInputRef = useRef(currentInput);
  const currentWordIndexRef = useRef(currentWordIndex);
  const hasTypedRef = useRef(hasTypedInCurrentWord);
  const wordsRef = useRef<string[]>(words);
  const keystrokesRef = useRef<KeystrokeEvent[]>(keystrokes);
  const completedInputsRef = useRef<string[]>(completedInputs);
  const timerRef = useRef<number | null>(null);

  // --- Mount: initialize words ---
  useEffect(() => {
    setWords(generateWords(500));
    setMounted(true);
  }, []);

  // Keep refs in sync
  useEffect(() => {
    isStartedRef.current = isStarted;
  }, [isStarted]);
  useEffect(() => {
    isFinishedRef.current = isFinished;
  }, [isFinished]);
  useEffect(() => {
    currentInputRef.current = currentInput;
  }, [currentInput]);
  useEffect(() => {
    currentWordIndexRef.current = currentWordIndex;
  }, [currentWordIndex]);
  useEffect(() => {
    hasTypedRef.current = hasTypedInCurrentWord;
  }, [hasTypedInCurrentWord]);
  useEffect(() => {
    wordsRef.current = words;
  }, [words]);
  useEffect(() => {
    keystrokesRef.current = keystrokes;
  }, [keystrokes]);
  useEffect(() => {
    completedInputsRef.current = completedInputs;
  }, [completedInputs]);

  // Update timeLeft if duration changes while NOT started
  useEffect(() => {
    if (!isStartedRef.current) setTimeLeft(duration);
  }, [duration]);

  // --- Timer loop ---
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

  // --- Infinite words generation / trimming ---
  useEffect(() => {
    if (currentWordIndex > words.length - 100) {
      const more = generateWords(500);
      setWords((prev) => {
        const keepFrom = Math.max(0, prev.length - 200);
        const trimmed = prev.slice(keepFrom);
        const merged = [...trimmed, ...more];
        wordsRef.current = merged;

        if (keepFrom > 0) {
          const adjust = keepFrom;
          setCurrentWordIndex((curr) => {
            const newIndex = Math.max(0, curr - adjust);
            currentWordIndexRef.current = newIndex;
            return newIndex;
          });

          setCompletedInputs((prevInputs) => {
            const newInputs = prevInputs.slice(adjust);
            completedInputsRef.current = newInputs;
            return newInputs;
          });
        }
        return merged;
      });
    }
  }, [currentWordIndex, words.length]);

  // --- Helpers ---
  const startTestIfTypingKey = useCallback((key: string) => {
    if (isStartedRef.current || isFinishedRef.current) return;
    if (!isTypingStarterKey(key)) return;
    setIsStarted(true);
    isStartedRef.current = true;
    setStartTime(Date.now());
  }, []);

  const commitCurrentWord = useCallback(() => {
    if (!hasTypedRef.current) return;

    const currentWordInput = currentInputRef.current;
    const currentIndex = currentWordIndexRef.current;
    const nextIndex = currentIndex + 1;

    // Update refs first
    currentWordIndexRef.current = nextIndex;
    currentInputRef.current = "";
    hasTypedRef.current = false;

    // Update state
    setCompletedInputs((prev) => {
      const next = [...prev];
      while (next.length <= currentIndex) {
        next.push("");
      }
      next[currentIndex] = currentWordInput;
      completedInputsRef.current = next;
      return next;
    });

    setCurrentWordIndex(nextIndex);
    setCurrentInput("");
    setHasTypedInCurrentWord(false);

    // Add space keystroke (spaces are always correct when used to move between words)
    setKeystrokes((prev) => {
      const next = [
        ...prev,
        { char: " ", correct: true, timestamp: Date.now(), isSpace: true },
      ];
      keystrokesRef.current = next;
      return next;
    });
  }, []);

  const resetTest = useCallback(() => {
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
    completedInputsRef.current = [];
    setKeystrokes([]);
    keystrokesRef.current = [];
    setHasTypedInCurrentWord(false);
    hasTypedRef.current = false;
    setWords(generateWords(500));
  }, [duration]);

  const newTest = useCallback(() => {
    resetTest();
  }, [resetTest]);

  const setFinished = useCallback((val: boolean) => {
    setIsFinished(val);
    isFinishedRef.current = val;
  }, []);

  // --- Main key processor ---
  const processKey = useCallback(
    (key: string) => {
      if (isFinishedRef.current) return;
      if (isModifierKey(key)) return;

      if (!isStartedRef.current) {
        startTestIfTypingKey(key);
        if (!isTypingStarterKey(key)) return;
      }

      const wordsLocal = wordsRef.current;
      const idx = currentWordIndexRef.current;
      const currentWord = wordsLocal[idx];
      if (!currentWord) return;

      // Backspace
      if (key === "Backspace") {
        if (currentInputRef.current.length > 0) {
          setCurrentInput((prev) => {
            const next = prev.slice(0, -1);
            currentInputRef.current = next;
            if (next.length === 0) {
              setHasTypedInCurrentWord(false);
              hasTypedRef.current = false;
            }
            return next;
          });
          setKeystrokes((prev) => {
            const next = prev.slice(0, -1);
            keystrokesRef.current = next;
            return next;
          });
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
        setCurrentInput((prev) => {
          const next = prev + key;
          currentInputRef.current = next;
          return next;
        });

        if (!hasTypedRef.current) {
          setHasTypedInCurrentWord(true);
          hasTypedRef.current = true;
        }

        const charIndex = currentInputRef.current.length - 1;
        const expectedChar = (currentWord[charIndex] ?? "").toLowerCase();
        const isCorrect = key.toLowerCase() === expectedChar;

        setKeystrokes((prev) => {
          const next = [
            ...prev,
            {
              char: key,
              correct: isCorrect,
              timestamp: Date.now(),
              isSpace: false,
            },
          ];
          keystrokesRef.current = next;
          return next;
        });
      }
    },
    [commitCurrentWord, startTestIfTypingKey]
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
