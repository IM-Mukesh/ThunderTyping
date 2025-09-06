"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Caret from "./Caret";

interface WordDisplayProps {
  words: string[];
  currentWordIndex: number;
  currentInput: string;
  completedInputs: string[];
  // optional: number of visible lines (keeps layout stable)
  visibleLines?: number;
}

interface WordPosition {
  word: string;
  index: number;
  x: number;
  y: number;
  width: number;
  lineIndex: number;
}

// locked typography values to avoid layout shift
const FONT_PX = 22; // matches your design
const LINE_PX = 44; // line-height px
const WORD_SPACING = 16; // px between words
const DEFAULT_VISIBLE_LINES = 3;

export function WordDisplay({
  words,
  currentWordIndex,
  currentInput,
  completedInputs,
  visibleLines = DEFAULT_VISIBLE_LINES,
}: WordDisplayProps) {
  const [mounted, setMounted] = useState(false);
  const [containerWidth, setContainerWidth] = useState(800);
  const [currentLineOffset, setCurrentLineOffset] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const measurerRef = useRef<HTMLSpanElement | null>(null);

  // create a hidden measurer once
  useEffect(() => {
    setMounted(true);

    if (!measurerRef.current) {
      const span = document.createElement("span");
      span.style.position = "absolute";
      span.style.visibility = "hidden";
      span.style.whiteSpace = "nowrap";
      span.style.fontSize = `${FONT_PX}px`;
      span.style.lineHeight = `${LINE_PX}px`;
      (span.style as any).fontFamily = "inherit";
      document.body.appendChild(span);
      measurerRef.current = span;
    }

    const updateWidth = () => {
      if (containerRef.current)
        setContainerWidth(containerRef.current.offsetWidth);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);

    return () => {
      window.removeEventListener("resize", updateWidth);
      // remove measurer when unmounting
      if (measurerRef.current && measurerRef.current.parentNode) {
        measurerRef.current.parentNode.removeChild(measurerRef.current);
        measurerRef.current = null;
      }
    };
  }, []);

  // compute positions for a limited window around currentWordIndex for performance
  const wordPositions = useMemo(() => {
    if (!mounted || containerWidth === 0 || words.length === 0) return [];

    const measurer = measurerRef.current!;
    const positions: WordPosition[] = [];

    let currentX = 0;
    let currentY = 0;
    let lineIndex = 0;

    // limit to words from max(0, currentIndex-50) to currentIndex+200 to avoid huge layout costs
    const startIdx = Math.max(0, currentWordIndex - 50);
    const endIdx = Math.min(words.length - 1, currentWordIndex + 200);

    for (let i = startIdx; i <= endIdx; i++) {
      const word = words[i];
      if (!word) continue;

      measurer.textContent = word;
      const measured =
        measurer.offsetWidth || Math.max(10, word.length * (FONT_PX * 0.6));

      const wordWidth = measured;

      if (currentX + wordWidth > containerWidth && currentX > 0) {
        currentX = 0;
        currentY += LINE_PX;
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

      currentX += wordWidth + WORD_SPACING;
    }

    return positions;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words, mounted, containerWidth, currentWordIndex]);

  // update currentLineOffset so the current word stays roughly centered vertically
  useEffect(() => {
    const cur = wordPositions.find((p) => p.index === currentWordIndex);
    if (!cur) return;
    const targetLine = cur.lineIndex;
    if (targetLine >= currentLineOffset + visibleLines - 1) {
      setCurrentLineOffset(Math.max(0, targetLine - (visibleLines - 2)));
    } else if (targetLine < currentLineOffset) {
      setCurrentLineOffset(Math.max(0, targetLine));
    }
    // keep currentLineOffset in dependency so it updates accordingly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWordIndex, wordPositions]);

  // Render a single word position
  const renderWord = (pos: WordPosition) => {
    const { word, index } = pos;

    const top = pos.y - currentLineOffset * LINE_PX;
    const style: React.CSSProperties = {
      position: "absolute",
      left: pos.x,
      top,
    };

    // Completed words (index < currentWordIndex)
    if (index < currentWordIndex) {
      const typed = completedInputs[index] || "";

      // Debug: If this word should be completed but has no typed input,
      // it means there's an issue with the completedInputs array
      console.log(
        `Word ${index}: "${word}" | Typed: "${typed}" | CompletedInputs length: ${completedInputs.length}`
      );

      return (
        <span
          key={index}
          className="inline-flex items-center mr-4 whitespace-pre"
          style={style}
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
                    ? "text-white font-bold"
                    : typedCh !== undefined
                    ? "text-red-500"
                    : "text-neutral-400"
                }
              >
                {ch}
              </span>
            );
          })}

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

    // Current word (index === currentWordIndex)
    if (index === currentWordIndex) {
      const typed = currentInput;
      const chars = word.split("");

      return (
        <span
          key={index}
          className="inline-flex items-center mr-4 whitespace-pre"
          style={style}
        >
          {chars.map((ch, ci) => {
            const typedCh = typed[ci];
            const isCorrect =
              typedCh !== undefined &&
              typedCh.toLowerCase() === ch.toLowerCase();
            const showCaret = mounted && ci === typed.length;

            return (
              <React.Fragment key={ci}>
                {showCaret && <Caret height={24} width={2} />}
                <span
                  className={
                    typedCh !== undefined
                      ? isCorrect
                        ? "text-white font-bold" // All correctly typed characters should be white and bold
                        : "text-red-500" // Incorrect characters are red
                      : "text-neutral-300" // Untyped characters are gray
                  }
                >
                  {ch}
                </span>
              </React.Fragment>
            );
          })}

          {mounted && currentInput.length >= word.length && (
            <span
              className="inline-block align-middle animate-caret"
              style={{
                width: 2,
                height: 24,
                background:
                  "linear-gradient(90deg, rgb(34 211 238) 0%, rgb(59 130 246) 100%)",
                marginLeft: 2,
              }}
              aria-hidden
            />
          )}

          {currentInput.length > word.length &&
            currentInput
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
        style={style}
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
      {/* hidden measurer element (kept for potential debugging) */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          visibility: "hidden",
          fontSize: `${FONT_PX}px`,
          lineHeight: `${LINE_PX}px`,
        }}
      />

      <div
        ref={containerRef}
        className="relative overflow-hidden text-white"
        style={{
          height: LINE_PX * visibleLines,
          fontSize: `${FONT_PX}px`,
          lineHeight: `${LINE_PX}px`,
          transition: "transform .3s ease",
        }}
      >
        {wordPositions.map((pos) => {
          const relativeY = pos.y - currentLineOffset * LINE_PX;
          // Only render words that fall within a slightly larger window to avoid pop-in
          if (
            relativeY >= -LINE_PX &&
            relativeY < LINE_PX * (visibleLines + 1)
          ) {
            return renderWord(pos);
          }
          return null;
        })}
      </div>
    </div>
  );
}

export default WordDisplay;
