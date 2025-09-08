"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { generateWords } from "@/lib/word-generator";

// Types remain the same
export interface KeystrokeEvent {
  char: string;
  correct: boolean;
  timestamp: number;
  isSpace: boolean;
  wasBackspaced?: boolean;
  originalPosition?: number;
}

export interface UseTypingEngineResults {
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  correctChars: number;
  totalChars: number;
  correctWords: number;
  totalWords: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  backspaceCount: number;
}

export interface UseTypingEngineState {
  isStarted: boolean;
  isFinished: boolean;
  timeLeft: number;
  startTime: number | null;
  words: string[];
  currentWordIndex: number;
  currentInput: string;
  completedInputs: string[];
  keystrokes: KeystrokeEvent[];
  allKeystrokes: KeystrokeEvent[];
  hasTypedInCurrentWord: boolean;
}

export interface UseTypingEngineAPI extends UseTypingEngineState {
  results: UseTypingEngineResults;
  processKey: (key: string) => void;
  handleInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  resetTest: () => void;
  newTest: () => void;
  setFinished: (val: boolean) => void;
}

// Action types for reducer
type TypingAction =
  | { type: "START_TEST"; timestamp: number }
  | { type: "FINISH_TEST" }
  | { type: "UPDATE_TIME"; timeLeft: number }
  | {
      type: "ADD_CHARACTER";
      char: string;
      isCorrect: boolean;
      timestamp: number;
    }
  | { type: "BACKSPACE"; timestamp: number }
  | { type: "COMMIT_WORD"; timestamp: number }
  | { type: "RESET_TEST"; duration: number; words: string[] }
  | { type: "GENERATE_MORE_WORDS"; newWords: string[] }
  | { type: "TRIM_WORDS"; keepFrom: number };

// Optimized reducer to batch state updates
function typingReducer(
  state: UseTypingEngineState,
  action: TypingAction
): UseTypingEngineState {
  switch (action.type) {
    case "START_TEST":
      return {
        ...state,
        isStarted: true,
        startTime: action.timestamp,
      };

    case "FINISH_TEST":
      return {
        ...state,
        isFinished: true,
        isStarted: false,
      };

    case "UPDATE_TIME":
      return {
        ...state,
        timeLeft: action.timeLeft,
      };

    case "ADD_CHARACTER": {
      const keystroke: KeystrokeEvent = {
        char: action.char,
        correct: action.isCorrect,
        timestamp: action.timestamp,
        isSpace: action.char === " ",
        originalPosition: state.currentInput.length,
      };

      return {
        ...state,
        currentInput: state.currentInput + action.char,
        keystrokes: [...state.keystrokes, keystroke],
        allKeystrokes: [...state.allKeystrokes, keystroke],
        hasTypedInCurrentWord: true,
      };
    }

    case "BACKSPACE": {
      if (state.currentInput.length === 0) return state;

      const backspaceEvent: KeystrokeEvent = {
        char: "Backspace",
        correct: false,
        timestamp: action.timestamp,
        isSpace: false,
      };

      // Mark last keystroke as backspaced
      const updatedAllKeystrokes = [...state.allKeystrokes, backspaceEvent];
      for (let i = updatedAllKeystrokes.length - 2; i >= 0; i--) {
        if (
          updatedAllKeystrokes[i].char !== "Backspace" &&
          !updatedAllKeystrokes[i].wasBackspaced
        ) {
          updatedAllKeystrokes[i] = {
            ...updatedAllKeystrokes[i],
            wasBackspaced: true,
          };
          break;
        }
      }

      return {
        ...state,
        currentInput: state.currentInput.slice(0, -1),
        keystrokes: state.keystrokes.slice(0, -1),
        allKeystrokes: updatedAllKeystrokes,
        hasTypedInCurrentWord: state.currentInput.length > 1,
      };
    }

    case "COMMIT_WORD": {
      if (!state.hasTypedInCurrentWord) return state;

      const updatedInputs = [...state.completedInputs];
      while (updatedInputs.length <= state.currentWordIndex) {
        updatedInputs.push("");
      }
      updatedInputs[state.currentWordIndex] = state.currentInput;

      const spaceKeystroke: KeystrokeEvent = {
        char: " ",
        correct: true,
        timestamp: action.timestamp,
        isSpace: true,
      };

      return {
        ...state,
        completedInputs: updatedInputs,
        currentWordIndex: state.currentWordIndex + 1,
        currentInput: "",
        keystrokes: [...state.keystrokes, spaceKeystroke],
        allKeystrokes: [...state.allKeystrokes, spaceKeystroke],
        hasTypedInCurrentWord: false,
      };
    }

    case "RESET_TEST":
      return {
        isStarted: false,
        isFinished: false,
        timeLeft: action.duration,
        startTime: null,
        words: action.words,
        currentWordIndex: 0,
        currentInput: "",
        completedInputs: [],
        keystrokes: [],
        allKeystrokes: [],
        hasTypedInCurrentWord: false,
      };

    case "GENERATE_MORE_WORDS":
      return {
        ...state,
        words: [...state.words, ...action.newWords],
      };

    case "TRIM_WORDS": {
      const trimmed = state.words.slice(action.keepFrom);
      const newIndex = Math.max(0, state.currentWordIndex - action.keepFrom);
      const newInputs = state.completedInputs.slice(action.keepFrom);

      return {
        ...state,
        words: trimmed,
        currentWordIndex: newIndex,
        completedInputs: newInputs,
      };
    }

    default:
      return state;
  }
}

// Memoized calculation function
const calculateResults = (
  keystrokes: KeystrokeEvent[],
  allKeystrokes: KeystrokeEvent[],
  completedInputs: string[],
  words: string[],
  currentWordIndex: number,
  currentInput: string,
  duration: number,
  startTime: number | null,
  isFinished: boolean
): UseTypingEngineResults => {
  const totalKeystrokes = allKeystrokes.filter(
    (k) => !k.isSpace && k.char !== "Backspace"
  ).length;

  const correctKeystrokes = allKeystrokes.filter(
    (k) => !k.isSpace && k.char !== "Backspace" && k.correct && !k.wasBackspaced
  ).length;

  const backspaceCount = allKeystrokes.filter(
    (k) => k.char === "Backspace"
  ).length;

  let totalCharsTyped = 0;
  let correctCharsTyped = 0;

  // Calculate completed words
  for (let i = 0; i < Math.min(completedInputs.length, currentWordIndex); i++) {
    const typedWord = completedInputs[i] || "";
    const expectedWord = words[i] || "";

    totalCharsTyped += typedWord.length;

    for (let j = 0; j < Math.min(typedWord.length, expectedWord.length); j++) {
      if (typedWord[j].toLowerCase() === expectedWord[j].toLowerCase()) {
        correctCharsTyped++;
      }
    }

    if (
      i < currentWordIndex - 1 ||
      (i === currentWordIndex - 1 && currentWordIndex < words.length)
    ) {
      totalCharsTyped += 1;
      correctCharsTyped += 1;
    }
  }

  // Calculate current word
  if (currentWordIndex < words.length && currentInput.length > 0) {
    const expectedWord = words[currentWordIndex] || "";
    totalCharsTyped += currentInput.length;

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

  // Calculate time
  let minutes = duration / 60;
  if (!isFinished && startTime) {
    const elapsedMs = Date.now() - startTime;
    minutes = Math.max(elapsedMs / 60000, 1 / 60);
  }

  const keystrokeAccuracy =
    totalKeystrokes > 0 ? correctKeystrokes / totalKeystrokes : 0;
  const finalStateAccuracy =
    totalCharsTyped > 0 ? correctCharsTyped / totalCharsTyped : 0;
  const accuracy = Math.min(keystrokeAccuracy, finalStateAccuracy);

  const grossWpm = minutes > 0 ? Math.round(totalCharsTyped / 5 / minutes) : 0;
  const netWpm = Math.round(grossWpm * accuracy);

  // Word accuracy
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
};

// Utility functions
const isTypingStarterKey = (key: string): boolean => {
  return key.length === 1 && key !== " ";
};

const isModifierKey = (key: string): boolean => {
  return ["Shift", "Alt", "Control", "Meta"].includes(key);
};

export function useTypingEngine(duration: number): UseTypingEngineAPI {
  // Initialize state with reducer
  const [state, dispatch] = useReducer(typingReducer, {
    isStarted: false,
    isFinished: false,
    timeLeft: duration,
    startTime: null,
    words: [],
    currentWordIndex: 0,
    currentInput: "",
    completedInputs: [],
    keystrokes: [],
    allKeystrokes: [],
    hasTypedInCurrentWord: false,
  });

  // Refs for stable references
  const timerRef = useRef<number | null>(null);
  const isActiveRef = useRef<boolean>(false);
  const durationRef = useRef(duration);

  // Update duration ref when it changes
  useEffect(() => {
    durationRef.current = duration;
    if (!state.isStarted) {
      dispatch({ type: "UPDATE_TIME", timeLeft: duration });
    }
  }, [duration, state.isStarted]);

  // Track active state
  useEffect(() => {
    isActiveRef.current = state.isStarted && !state.isFinished;
  }, [state.isStarted, state.isFinished]);

  // Initialize words on mount
  useEffect(() => {
    const words = generateWords(500);
    dispatch({ type: "RESET_TEST", duration, words });
  }, []);

  // Timer effect - optimized with fewer dependencies
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (state.isStarted && !state.isFinished && state.startTime) {
      timerRef.current = window.setInterval(() => {
        if (!isActiveRef.current) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return;
        }

        const elapsed = Math.floor((Date.now() - state.startTime!) / 1000);
        const remaining = Math.max(0, durationRef.current - elapsed);

        dispatch({ type: "UPDATE_TIME", timeLeft: remaining });

        if (remaining <= 0) {
          dispatch({ type: "FINISH_TEST" });
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
  }, [state.isStarted, state.isFinished, state.startTime]);

  // Word generation effect - debounced
  useEffect(() => {
    if (state.currentWordIndex > state.words.length - 100) {
      const moreWords = generateWords(500);
      dispatch({ type: "GENERATE_MORE_WORDS", newWords: moreWords });

      // Trim if needed
      if (state.words.length > 700) {
        const keepFrom = Math.max(0, state.words.length - 200);
        dispatch({ type: "TRIM_WORDS", keepFrom });
      }
    }
  }, [state.currentWordIndex, state.words.length]);

  // Memoized callbacks
  const processKey = useCallback(
    (key: string) => {
      if (state.isFinished || isModifierKey(key)) return;

      // Start test if needed
      if (!state.isStarted && isTypingStarterKey(key)) {
        dispatch({ type: "START_TEST", timestamp: Date.now() });
      }

      if (!state.isStarted && !isTypingStarterKey(key)) return;

      const currentWord = state.words[state.currentWordIndex];
      if (!currentWord) return;

      const timestamp = Date.now();

      if (key === "Backspace") {
        dispatch({ type: "BACKSPACE", timestamp });
        return;
      }

      if (key === " ") {
        dispatch({ type: "COMMIT_WORD", timestamp });
        return;
      }

      if (key === "Enter" || key === "Tab" || key === "Escape") return;

      // Regular character
      if (key.length === 1 && !/[\x00-\x1F]/.test(key)) {
        // Check wrong character limit
        let wrongCharsInCurrentWord = 0;
        const maxWrongChars = 10;

        for (let i = 0; i < state.currentInput.length; i++) {
          const expectedChar = (currentWord[i] ?? "").toLowerCase();
          const typedChar = state.currentInput[i].toLowerCase();
          if (typedChar !== expectedChar) {
            wrongCharsInCurrentWord++;
          }
        }

        const charIndex = state.currentInput.length;
        const expectedChar = currentWord[charIndex] ?? "";
        const isCorrect = key === expectedChar;

        if (!isCorrect && wrongCharsInCurrentWord >= maxWrongChars) return;
        if (
          charIndex >= currentWord.length &&
          wrongCharsInCurrentWord >= maxWrongChars
        )
          return;

        dispatch({ type: "ADD_CHARACTER", char: key, isCorrect, timestamp });
      }
    },
    [
      state.isFinished,
      state.isStarted,
      state.words,
      state.currentWordIndex,
      state.currentInput,
    ]
  );

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

  const resetTest = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    isActiveRef.current = false;
    const words = generateWords(500);
    dispatch({ type: "RESET_TEST", duration: durationRef.current, words });
  }, []);

  const newTest = useCallback(() => {
    resetTest();
  }, [resetTest]);

  const setFinished = useCallback((val: boolean) => {
    if (val) {
      dispatch({ type: "FINISH_TEST" });
    }
  }, []);

  // Memoized results calculation
  const results = useMemo(() => {
    return calculateResults(
      state.keystrokes,
      state.allKeystrokes,
      state.completedInputs,
      state.words,
      state.currentWordIndex,
      state.currentInput,
      durationRef.current,
      state.startTime,
      state.isFinished
    );
  }, [
    state.keystrokes,
    state.allKeystrokes,
    state.completedInputs,
    state.words,
    state.currentWordIndex,
    state.currentInput,
    state.startTime,
    state.isFinished,
  ]);

  return {
    ...state,
    results,
    processKey,
    handleInputKeyDown,
    resetTest,
    newTest,
    setFinished,
  };
}
