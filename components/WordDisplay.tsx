"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
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
  const cleanupRef = useRef<boolean>(false);

  const updateWidth = useCallback(() => {
    if (containerRef.current && !cleanupRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  const debouncedUpdateWidth = useCallback(() => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateWidth, 100);
    };
  }, [updateWidth]);

  useEffect(() => {
    setMounted(true);
    cleanupRef.current = false;

    if (!measurerRef.current) {
      try {
        const span = document.createElement("span");
        span.style.position = "absolute";
        span.style.visibility = "hidden";
        span.style.whiteSpace = "nowrap";
        span.style.fontSize = `${FONT_PX}px`;
        span.style.lineHeight = `${LINE_PX}px`;
        (span.style as any).fontFamily = "inherit";
        span.style.pointerEvents = "none"; // Prevent any interaction
        document.body.appendChild(span);
        measurerRef.current = span;
      } catch (error) {
        console.warn("[WordDisplay] Failed to create measurer element:", error);
      }
    }

    updateWidth();
    const debouncedHandler = debouncedUpdateWidth();
    window.addEventListener("resize", debouncedHandler);

    return () => {
      cleanupRef.current = true;
      window.removeEventListener("resize", debouncedHandler);

      if (measurerRef.current) {
        try {
          if (measurerRef.current.parentNode) {
            measurerRef.current.parentNode.removeChild(measurerRef.current);
          }
        } catch (error) {
          console.warn(
            "[WordDisplay] Failed to remove measurer element:",
            error
          );
        } finally {
          measurerRef.current = null;
        }
      }
    };
  }, [updateWidth, debouncedUpdateWidth]);

  const wordPositions = useMemo(() => {
    if (
      !mounted ||
      containerWidth === 0 ||
      words.length === 0 ||
      !measurerRef.current
    )
      return [];

    const measurer = measurerRef.current;
    const positions: WordPosition[] = [];

    let currentX = 0;
    let currentY = 0;
    let lineIndex = 0;

    const startIdx = Math.max(0, currentWordIndex - 30);
    const endIdx = Math.min(words.length - 1, currentWordIndex + 100);

    for (let i = startIdx; i <= endIdx; i++) {
      const word = words[i];
      if (!word) continue;

      let wordWidth: number;
      try {
        measurer.textContent = word;
        wordWidth =
          measurer.offsetWidth || Math.max(10, word.length * (FONT_PX * 0.6));
      } catch (error) {
        wordWidth = Math.max(10, word.length * (FONT_PX * 0.6));
      }

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
  }, [words, mounted, containerWidth, currentWordIndex]);

  useEffect(() => {
    if (wordPositions.length === 0) return;

    const currentWordPos = wordPositions.find(
      (pos) => pos.index === currentWordIndex
    );
    if (currentWordPos) {
      const currentLine = currentWordPos.lineIndex;
      const maxVisibleLine = currentLineOffset + visibleLines - 1;

      // Scroll down if current word is below visible area
      if (currentLine > maxVisibleLine) {
        setCurrentLineOffset(currentLine - visibleLines + 1);
      }
      // Scroll up if current word is above visible area
      else if (currentLine < currentLineOffset) {
        setCurrentLineOffset(currentLine);
      }
    }
  }, [currentWordIndex, wordPositions, visibleLines, currentLineOffset]);

  const renderWord = (pos: WordPosition) => {
    const { word, index } = pos;

    const top = pos.y - currentLineOffset * LINE_PX;
    const style: React.CSSProperties = {
      position: "absolute",
      left: pos.x,
      top,
    };

    if (index < currentWordIndex) {
      const typed = completedInputs[index] || "";

      return (
        <span
          key={index}
          className="inline-flex items-center mr-4 whitespace-pre"
          style={style}
        >
          {word.split("").map((ch, ci) => {
            const typedCh = typed[ci];
            const isCorrect = typedCh !== undefined && typedCh === ch;
            return (
              <span
                key={ci}
                className={
                  isCorrect
                    ? "text-transparent font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text"
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
                <span
                  key={"extra-" + ei}
                  className="text-red-500 relative"
                  style={{
                    maxWidth: "20px",
                    overflow: "hidden",
                    display: "inline-block",
                  }}
                >
                  {extra}
                </span>
              ))}
        </span>
      );
    }

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
            const isCorrect = typedCh !== undefined && typedCh === ch;
            const showCaret = mounted && ci === typed.length;

            return (
              <React.Fragment key={ci}>
                {showCaret && <Caret height={24} width={2} />}
                <span
                  className={
                    typedCh !== undefined
                      ? isCorrect
                        ? "text-transparent font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text"
                        : "text-red-500"
                      : "text-neutral-300"
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
                <span
                  key={"extra-cur-" + ei}
                  className="text-red-500 relative"
                  style={{
                    maxWidth: "15px",
                    overflow: "hidden",
                    display: "inline-block",
                    fontSize: "0.9em",
                  }}
                >
                  {extra}
                </span>
              ))}
        </span>
      );
    }

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
      <div
        ref={containerRef}
        className="relative overflow-hidden text-white"
        style={{
          height: LINE_PX * visibleLines,
          fontSize: `${FONT_PX}px`,
          lineHeight: `${LINE_PX}px`,
          transition: "transform .3s ease",
        }}
        role="region"
        aria-label="Typing area"
        aria-live="polite"
      >
        {wordPositions.map((pos) => {
          const relativeY = pos.y - currentLineOffset * LINE_PX;
          if (relativeY >= -LINE_PX && relativeY < LINE_PX * visibleLines) {
            return renderWord(pos);
          }
          return null;
        })}
      </div>
    </div>
  );
}

export default WordDisplay;
