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
  completedInputs: string[]; // typed strings for words already completed..
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
  const [currentLineOffset, setCurrentLineOffset] = useState(0);
  const FILLING_COLOR = "text-white";
  const containerRef = useRef<HTMLDivElement | null>(null);
  const measurerRef = useRef<HTMLSpanElement | null>(null);
  const cleanupRef = useRef(false);

  // Update container width (debounced)
  const updateWidth = useCallback(() => {
    if (containerRef.current && !cleanupRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

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
        // inherit font family to match real rendering
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
        } catch (_) {
          /* ignore */
        } finally {
          measurerRef.current = null;
        }
      }
    };
  }, [updateWidth]);

  // reset offset for new test (when engine resets to word 0)
  useEffect(() => {
    if (currentWordIndex === 0) {
      setCurrentLineOffset(0);
    }
  }, [currentWordIndex]);

  // 1) Measure native widths for words (cached; only when words/containerWidth/mount change)
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

  // 2) Measure widths for completedInputs (so previously typed-long words keep their space)
  const completedWidths = useMemo(() => {
    const measurer = measurerRef.current;
    if (!measurer || !mounted || !completedInputs)
      return {} as Record<number, number>;
    const map: Record<number, number> = {};
    for (let i = 0; i < completedInputs.length; i++) {
      const t = completedInputs[i] ?? "";
      if (!t) continue;
      try {
        measurer.textContent = t;
        const measured = measurer.offsetWidth;
        map[i] =
          measured && measured > 0
            ? measured
            : Math.max(10, Math.floor(t.length * FONT_PX * 0.6));
      } catch {
        map[i] = Math.max(10, Math.floor(t.length * FONT_PX * 0.6));
      }
    }
    return map;
    // include containerWidth so small font changes get recalculated on resize
  }, [completedInputs, mounted, containerWidth]);

  // 3) Measure currentInput width (every keystroke)
  const currentTypedWidth = useMemo(() => {
    const measurer = measurerRef.current;
    if (!measurer || !mounted) return 0;
    try {
      measurer.textContent = currentInput ?? "";
      const measured = measurer.offsetWidth;
      return measured && measured > 0
        ? measured
        : Math.max(10, Math.floor((currentInput?.length || 0) * FONT_PX * 0.6));
    } catch {
      return Math.max(
        10,
        Math.floor((currentInput?.length || 0) * FONT_PX * 0.6)
      );
    }
  }, [currentInput, mounted, containerWidth]);

  // 4) Build absolute positions using effective widths (accounting for typed extras)
  //    Depend on measuredWidths, completedWidths, and currentTypedWidth so positions update responsively.
  const wordPositions = useMemo(() => {
    if (!measuredWidths || measuredWidths.length === 0)
      return [] as WordPosition[];

    const positions: WordPosition[] = [];
    let curX = 0;
    let curY = 0;
    let lineIndex = 0;

    for (let i = 0; i < measuredWidths.length; i++) {
      const w = words[i] ?? "";
      const baseWidth =
        measuredWidths[i] ?? Math.max(10, Math.floor(w.length * FONT_PX * 0.6));

      // Effective width includes typed text for completed/current words
      let effectiveWidth = baseWidth;

      // Completed typed text (if any) may be wider than original word; use that
      if (completedWidths[i] !== undefined) {
        effectiveWidth = Math.max(effectiveWidth, completedWidths[i]);
      }

      // For current word, consider currentInput typed width (includes extras)
      if (i === currentWordIndex) {
        if ((currentInput?.length ?? 0) > 0) {
          effectiveWidth = Math.max(effectiveWidth, currentTypedWidth);
        }
      }

      // wrap to next line if needed
      if (curX + effectiveWidth > containerWidth && curX > 0) {
        curX = 0;
        curY += LINE_PX;
        lineIndex++;
      }

      positions.push({
        word: w,
        index: i,
        x: curX,
        y: curY,
        width: effectiveWidth,
        lineIndex,
      });

      curX += effectiveWidth + WORD_SPACING;
    }

    return positions;
  }, [
    measuredWidths,
    completedWidths,
    currentTypedWidth,
    words,
    containerWidth,
    currentInput,
    currentWordIndex,
  ]);

  // 5) Scrolling logic: if current word goes below second visible line, scroll exactly one line.
  useEffect(() => {
    if (!wordPositions || wordPositions.length === 0) return;
    if (currentWordIndex < 0 || currentWordIndex >= wordPositions.length)
      return;

    const pos = wordPositions[currentWordIndex];
    if (!pos) return;

    // relative top of current word inside the visible window
    const relativeTop = pos.y - currentLineOffset * LINE_PX;

    // If current word goes below the start of the 3rd row (index 2), scroll one line
    // so the current word will appear at second visible line start.
    if (relativeTop >= LINE_PX * 2) {
      setCurrentLineOffset((prev) => prev + 1);
      return;
    }

    // If current word moved above the visible area, snap it into view (scroll up).
    if (relativeTop < 0) {
      const targetLine = pos.lineIndex;
      setCurrentLineOffset(Math.max(0, targetLine));
      return;
    }
    // otherwise no change
  }, [wordPositions, currentWordIndex, currentLineOffset, visibleLines]);

  // Helper to render a single word with typed styling
  const renderWord = (pos: WordPosition) => {
    const { word, index } = pos;
    const top = pos.y - currentLineOffset * LINE_PX;
    const style: React.CSSProperties = {
      position: "absolute",
      left: pos.x,
      top,
      whiteSpace: "pre",
    };

    // Already-completed words: show each char colored by correctness; show extras (if any)
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
                    ? FILLING_COLOR
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
                    display: "inline-block",
                    overflow: "hidden",
                    maxWidth: "20px",
                  }}
                >
                  {extra}
                </span>
              ))}
        </span>
      );
    }

    // Current word being typed
    if (index === currentWordIndex) {
      const typed = currentInput ?? "";
      const chars = word.split("");

      // Case A: typed inside word (typed.length <= word.length)
      // Case B: typed overflow/extras (typed.length > word.length)
      const inWord = typed.length <= chars.length;
      const extras =
        typed.length > chars.length ? typed.slice(chars.length) : "";

      return (
        <span
          key={index}
          className="inline-flex items-center mr-4 whitespace-pre"
          style={style}
        >
          {chars.map((ch, ci) => {
            const typedCh = typed[ci];
            const isCorrect = typedCh !== undefined && typedCh === ch;
            const showCaretHere = mounted && ci === typed.length && inWord;

            return (
              <React.Fragment key={ci}>
                {showCaretHere && <Caret height={24} width={2} />}
                <span
                  className={
                    typedCh !== undefined
                      ? isCorrect
                        ? FILLING_COLOR
                        : "text-red-500"
                      : "text-neutral-300"
                  }
                >
                  {ch}
                </span>
              </React.Fragment>
            );
          })}

          {/* If typed at or beyond word end, show extras inline and then caret after extras */}
          {extras.length > 0 &&
            extras.split("").map((ex, ei) => (
              <span
                key={"extra-cur-" + ei}
                className="text-red-500 relative"
                style={{
                  display: "inline-block",
                  overflow: "hidden",
                  maxWidth: "20px",
                  fontSize: "0.9em",
                }}
              >
                {ex}
              </span>
            ))}

          {/* Caret after extras (or after word when fully typed) */}
          {mounted && typed.length >= chars.length && (
            <Caret height={24} width={2} />
          )}
        </span>
      );
    }

    // Future words (not yet typed)
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
