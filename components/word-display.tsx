"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";

interface WordDisplayProps {
  words: string[];
  currentWordIndex: number;
  currentInput: string;
  completedInputs: string[];
  isStarted: boolean;
}

interface WordPosition {
  word: string;
  index: number;
  x: number;
  y: number;
  width: number;
  lineIndex: number;
}

export function WordDisplay({
  words,
  currentWordIndex,
  currentInput,
  completedInputs,
}: WordDisplayProps) {
  const [mounted, setMounted] = useState(false);
  const [containerWidth, setContainerWidth] = useState(800);
  const [currentLineOffset, setCurrentLineOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Measure container width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Calculate word positions for line-based layout
  const wordPositions = useMemo(() => {
    if (!mounted || containerWidth === 0) return [];

    const positions: WordPosition[] = [];
    const lineHeight = 40; // Height of each line
    const wordSpacing = 16; // Space between words (mr-4 = 16px)
    let currentX = 0;
    let currentY = 0;
    let lineIndex = 0;

    // Create a temporary span for measuring if not available
    const measurer = measureRef.current || document.createElement("span");
    if (!measureRef.current) {
      measurer.style.position = "absolute";
      measurer.style.visibility = "hidden";
      measurer.style.whiteSpace = "nowrap";
      measurer.style.fontSize = "18px"; // text-lg
      measurer.style.fontFamily = "inherit";
      document.body.appendChild(measurer);
    }

    for (let i = 0; i < Math.min(words.length, currentWordIndex + 100); i++) {
      const word = words[i];
      if (!word) continue;

      // Measure word width
      measurer.textContent = word;
      const wordWidth = measurer.offsetWidth || word.length * 10; // Fallback

      // Check if word fits on current line
      if (currentX + wordWidth > containerWidth && currentX > 0) {
        // Move to next line
        currentX = 0;
        currentY += lineHeight;
        lineIndex++;
      }

      positions.push({
        word,
        index: i,
        x: currentX,
        y: currentY,
        width: wordWidth,
        lineIndex,
      });

      currentX += wordWidth + wordSpacing;
    }

    // Clean up temporary measurer
    if (!measureRef.current && measurer.parentNode) {
      document.body.removeChild(measurer);
    }

    return positions;
  }, [words, currentWordIndex, containerWidth, mounted]);

  // Calculate scroll offset to show current word
  useEffect(() => {
    const currentWordPos = wordPositions.find(
      (pos) => pos.index === currentWordIndex
    );
    if (currentWordPos) {
      const targetLineIndex = currentWordPos.lineIndex;

      // Show 3 lines at a time, scroll when user reaches the 3rd visible line
      if (targetLineIndex >= currentLineOffset + 2) {
        setCurrentLineOffset(targetLineIndex - 1);
      } else if (targetLineIndex < currentLineOffset) {
        setCurrentLineOffset(Math.max(0, targetLineIndex));
      }
    }
  }, [currentWordIndex, wordPositions]);

  const renderWord = (wordPos: WordPosition) => {
    const { word, index } = wordPos;

    // Completed words
    if (index < currentWordIndex) {
      const typed = completedInputs[index] || "";
      return (
        <span
          key={index}
          className="inline-flex items-center mr-4 whitespace-pre"
          style={{
            position: "absolute",
            left: wordPos.x,
            top: wordPos.y - currentLineOffset * 40,
          }}
        >
          {word.split("").map((ch, ci) => {
            const typedCh = typed[ci];
            const isCorrect =
              typedCh !== undefined &&
              typedCh.toLowerCase() === ch.toLowerCase();
            return (
              <span
                key={ci}
                className={
                  isCorrect
                    ? "text-green-400"
                    : typedCh !== undefined
                    ? "text-red-500"
                    : "text-neutral-400"
                }
              >
                {ch}
              </span>
            );
          })}
          {/* Extra chars typed */}
          {typed.length > word.length &&
            typed
              .slice(word.length)
              .split("")
              .map((extra, ei) => (
                <span key={"extra-" + ei} className="text-red-500">
                  {extra}
                </span>
              ))}
        </span>
      );
    }

    // Current word
    if (index === currentWordIndex) {
      const typed = currentInput;
      const chars = word.split("");

      return (
        <span
          key={index}
          className="inline-flex items-center mr-4 whitespace-pre bg-neutral-800/50 rounded px-1 py-0.5"
          style={{
            position: "absolute",
            left: wordPos.x,
            top: wordPos.y - currentLineOffset * 40,
          }}
        >
          {chars.map((ch, ci) => {
            const typedCh = typed[ci];
            const isCorrect =
              typedCh !== undefined &&
              typedCh.toLowerCase() === ch.toLowerCase();

            const showCaret = mounted && ci === typed.length;

            return (
              <React.Fragment key={ci}>
                {showCaret && (
                  <span
                    className="mr-0.5 w-0.5 h-5 bg-cyan-400 animate-pulse"
                    aria-hidden
                  />
                )}
                <span
                  className={
                    isCorrect
                      ? "text-green-400"
                      : typedCh !== undefined
                      ? "text-red-500"
                      : "text-neutral-300"
                  }
                >
                  {ch}
                </span>
              </React.Fragment>
            );
          })}

          {/* Caret after last char if word completed */}
          {mounted && typed.length >= word.length && (
            <span
              className="ml-0.5 w-0.5 h-5 bg-cyan-400 animate-pulse"
              aria-hidden
            />
          )}

          {/* Extra typed chars beyond current word */}
          {typed.length > word.length &&
            typed
              .slice(word.length)
              .split("")
              .map((extra, ei) => (
                <span key={"extra-cur-" + ei} className="text-red-500">
                  {extra}
                </span>
              ))}
        </span>
      );
    }

    // Future words
    return (
      <span
        key={index}
        className="inline-flex items-center mr-4 text-neutral-400 whitespace-pre"
        style={{
          position: "absolute",
          left: wordPos.x,
          top: wordPos.y - currentLineOffset * 40,
        }}
      >
        {word}
      </span>
    );
  };

  if (!mounted) {
    return (
      <div className="w-full max-w-4xl mx-auto h-32 flex items-center justify-center">
        <div className="text-neutral-400">Loading words...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Hidden span for measuring text */}
      <span
        ref={measureRef}
        className="absolute invisible whitespace-nowrap text-lg"
        aria-hidden="true"
      />

      {/* Word container with fixed height for 3 lines */}
      <div
        ref={containerRef}
        className="relative h-32 overflow-hidden text-lg leading-relaxed text-white"
        style={{ transition: "all 0.3s ease" }}
      >
        {wordPositions.map((wordPos) => {
          // Only render words within the visible area (3 lines + buffer)
          const relativeY = wordPos.y - currentLineOffset * 40;
          if (relativeY >= -40 && relativeY < 160) {
            return renderWord(wordPos);
          }
          return null;
        })}
      </div>
    </div>
  );
}
