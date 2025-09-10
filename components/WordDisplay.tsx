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
  visibleLines?: number;
}

interface WordPosition {
  word: string;
  index: number;
  x: number;
  y: number;
  width: number;
  lineIndex: number; // absolute line index in layout
}

// typography/layout constants
const FONT_PX = 22;
const LINE_PX = 44;
const WORD_SPACING = 16;
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
  // integer line offset (how many lines we have scrolled from top)
  const [currentLineOffset, setCurrentLineOffset] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const measurerRef = useRef<HTMLSpanElement | null>(null);
  const cleanupRef = useRef(false);

  // update container width (debounced)
  const updateWidth = useCallback(() => {
    if (containerRef.current && !cleanupRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    cleanupRef.current = false;

    // create hidden measurer span once
    if (!measurerRef.current) {
      try {
        const span = document.createElement("span");
        span.style.position = "absolute";
        span.style.visibility = "hidden";
        span.style.whiteSpace = "nowrap";
        span.style.fontSize = `${FONT_PX}px`;
        span.style.lineHeight = `${LINE_PX}px`;
        (span.style as any).fontFamily = "inherit";
        span.style.pointerEvents = "none";
        document.body.appendChild(span);
        measurerRef.current = span;
      } catch (err) {
        console.warn("[WordDisplay] measurer create failed", err);
      }
    }

    updateWidth();
    let tid: any;
    const onResize = () => {
      clearTimeout(tid);
      tid = setTimeout(updateWidth, 100);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cleanupRef.current = true;
      window.removeEventListener("resize", onResize);
      if (measurerRef.current && measurerRef.current.parentNode) {
        try {
          measurerRef.current.parentNode.removeChild(measurerRef.current);
        } catch (e) {
          /* ignore */
        } finally {
          measurerRef.current = null;
        }
      }
    };
  }, [updateWidth]);

  // 1) Measure widths (only when words/containerWidth change)
  const measuredWidths = useMemo(() => {
    const measurer = measurerRef.current;
    if (
      !measurer ||
      !mounted ||
      containerWidth === 0 ||
      !words ||
      words.length === 0
    ) {
      return new Array<number>(0);
    }

    const arr: number[] = new Array(words.length);
    for (let i = 0; i < words.length; i++) {
      const w = words[i] ?? "";
      try {
        measurer.textContent = w;
        const measured = measurer.offsetWidth;
        arr[i] =
          measured && measured > 0
            ? measured
            : Math.max(10, Math.floor(w.length * FONT_PX * 0.6));
      } catch {
        arr[i] = Math.max(10, Math.floor(w.length * FONT_PX * 0.6));
      }
    }
    return arr;
  }, [words, containerWidth, mounted]);

  // 2) Build absolute positions for ALL words (recomputed only when measuredWidths changes)
  //    This ensures stable lineIndex values and repeatable scrolling behavior.
  const wordPositions = useMemo(() => {
    if (!measuredWidths || measuredWidths.length === 0)
      return [] as WordPosition[];

    const positions: WordPosition[] = [];
    let curX = 0;
    let curY = 0;
    let lineIndex = 0;

    for (let i = 0; i < measuredWidths.length; i++) {
      const w = words[i] ?? "";
      const width =
        measuredWidths[i] ?? Math.max(10, Math.floor(w.length * FONT_PX * 0.6));

      // wrap to next line if needed
      if (curX + width > containerWidth && curX > 0) {
        curX = 0;
        curY += LINE_PX;
        lineIndex++;
      }

      positions.push({
        word: w,
        index: i,
        x: curX,
        y: curY,
        width,
        lineIndex,
      });

      curX += width + WORD_SPACING;
    }

    return positions;
  }, [measuredWidths, words, containerWidth]);

  // 3) Scrolling logic: detect when the current word moves beyond the SECOND visible line
  //    and scroll exactly one line (so the current word becomes positioned at second visible line start).
  useEffect(() => {
    if (!wordPositions || wordPositions.length === 0) return;
    if (currentWordIndex < 0 || currentWordIndex >= wordPositions.length)
      return;

    const pos = wordPositions[currentWordIndex];
    if (!pos) return;

    // compute relative top of current word in pixels within the visible window
    const relativeTop = pos.y - currentLineOffset * LINE_PX;

    // If the current word goes below the second visible line start (i.e. index >= 2),
    // scroll up by exactly one line so the current word's top becomes LINE_PX (second line start).
    // visibleLines default 3 -> second visible line index = 1 -> trigger at >= 2 lines (0-based)
    if (relativeTop >= LINE_PX * 2) {
      setCurrentLineOffset((prev) => prev + 1);
      return;
    }

    // If the current word moved above the visible area, snap it into view (scroll up).
    if (relativeTop < 0) {
      // place the word's line as the top visible line (so it's visible)
      const targetLine = pos.lineIndex;
      setCurrentLineOffset(Math.max(0, targetLine));
      return;
    }

    // Otherwise no change needed.
  }, [wordPositions, currentWordIndex, currentLineOffset, visibleLines]);

  // renderer for a single word position
  const renderWord = (pos: WordPosition) => {
    const { word, index } = pos;
    const top = pos.y - currentLineOffset * LINE_PX;
    const style: React.CSSProperties = {
      position: "absolute",
      left: pos.x,
      top,
    };

    if (index < currentWordIndex) {
      const typed = completedInputs[index] ?? "";

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

          {/* extra chars typed beyond word length */}
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
          transition: "transform .14s ease",
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
