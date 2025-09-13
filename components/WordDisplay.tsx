"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Caret from "./Caret";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

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
  lineIndex: number;
}

// your chosen values (kept here)
const FONT_PX = 26;
const LINE_PX = 50;
const WORD_SPACING = 16;
const LETTER_SPACING = 2.4;
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

  const Fcolor = useSelector(
    (state: RootState) => state.settings.currentFillColor
  );
  const FILLING_COLOR = "text-white";

  // IMPORTANT: containerRef refers to the visible container we render into.
  const containerRef = useRef<HTMLDivElement | null>(null);
  const measurerRef = useRef<HTMLSpanElement | null>(null);
  const cleanupRef = useRef(false);

  // sync container width from the actual visible container
  const updateWidth = useCallback(() => {
    if (containerRef.current && !cleanupRef.current) {
      // use clientWidth to respect padding/box-sizing set by parent card
      setContainerWidth(containerRef.current.clientWidth);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    cleanupRef.current = false;

    // create hidden measurer and ensure it uses the same typography as the visible container
    if (!measurerRef.current) {
      try {
        const span = document.createElement("span");
        span.style.position = "absolute";
        span.style.visibility = "hidden";
        span.style.whiteSpace = "pre"; // measure spaces as well
        span.style.fontSize = `${FONT_PX}px`;
        span.style.lineHeight = `${LINE_PX}px`;
        (span.style as any).fontFamily = "inherit";
        span.style.letterSpacing = `${LETTER_SPACING}px`;
        span.style.pointerEvents = "none";
        span.style.boxSizing = "content-box";
        document.body.appendChild(span);
        measurerRef.current = span;
      } catch (err) {
        console.warn("[WordDisplay] measurer create failed", err);
      }
    } else {
      // keep measurer in sync (HMR)
      try {
        measurerRef.current.style.fontSize = `${FONT_PX}px`;
        measurerRef.current.style.lineHeight = `${LINE_PX}px`;
        measurerRef.current.style.letterSpacing = `${LETTER_SPACING}px`;
        (measurerRef.current.style as any).fontFamily = "inherit";
        measurerRef.current.style.whiteSpace = "pre";
      } catch (_) {}
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

  // reset offset for new tests
  useEffect(() => {
    if (currentWordIndex === 0) setCurrentLineOffset(0);
  }, [currentWordIndex]);

  const fallbackWidthFor = (text: string) => {
    const avgChar = FONT_PX * 0.55;
    const totalLetterSpacing = Math.max(0, (text.length - 1) * LETTER_SPACING);
    return Math.max(6, Math.floor(text.length * avgChar + totalLetterSpacing));
  };

  const measuredWidths = useMemo(() => {
    const m = measurerRef.current;
    if (!m || !mounted || containerWidth === 0 || !words || words.length === 0)
      return new Array<number>(0);

    const arr: number[] = new Array(words.length);
    for (let i = 0; i < words.length; i++) {
      const w = words[i] ?? "";
      try {
        m.textContent = w;
        const measured = m.offsetWidth;
        arr[i] = measured && measured > 0 ? measured : fallbackWidthFor(w);
      } catch {
        arr[i] = fallbackWidthFor(w);
      }
    }
    return arr;
  }, [words, containerWidth, mounted]);

  const completedWidths = useMemo(() => {
    const m = measurerRef.current;
    if (!m || !mounted || !completedInputs) return {} as Record<number, number>;
    const map: Record<number, number> = {};
    for (let i = 0; i < completedInputs.length; i++) {
      const t = completedInputs[i] ?? "";
      if (!t) continue;
      try {
        m.textContent = t;
        const measured = m.offsetWidth;
        map[i] = measured && measured > 0 ? measured : fallbackWidthFor(t);
      } catch {
        map[i] = fallbackWidthFor(t);
      }
    }
    return map;
  }, [completedInputs, mounted, containerWidth]);

  const currentTypedWidth = useMemo(() => {
    const m = measurerRef.current;
    if (!m || !mounted) return 0;
    try {
      // measure exactly what's visible as typed for the current word
      m.textContent = currentInput ?? "";
      const measured = m.offsetWidth;
      return measured && measured > 0
        ? measured
        : fallbackWidthFor(currentInput ?? "");
    } catch {
      return fallbackWidthFor(currentInput ?? "");
    }
  }, [currentInput, mounted, containerWidth]);

  // build absolute positions using effective widths
  const wordPositions = useMemo(() => {
    if (!measuredWidths || measuredWidths.length === 0)
      return [] as WordPosition[];

    const positions: WordPosition[] = [];
    let curX = 0;
    let curY = 0;
    let lineIndex = 0;

    for (let i = 0; i < measuredWidths.length; i++) {
      const w = words[i] ?? "";
      const baseWidth = measuredWidths[i] ?? fallbackWidthFor(w);

      let effectiveWidth = baseWidth;
      if (completedWidths[i] !== undefined) {
        effectiveWidth = Math.max(effectiveWidth, completedWidths[i]);
      }

      if (i === currentWordIndex) {
        if ((currentInput?.length ?? 0) > 0) {
          effectiveWidth = Math.max(effectiveWidth, currentTypedWidth);
        }
      }

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

  // scroll logic
  useEffect(() => {
    if (!wordPositions || wordPositions.length === 0) return;
    if (currentWordIndex < 0 || currentWordIndex >= wordPositions.length)
      return;
    const pos = wordPositions[currentWordIndex];
    if (!pos) return;
    const relativeTop = pos.y - currentLineOffset * LINE_PX;
    if (relativeTop >= LINE_PX * 2) {
      setCurrentLineOffset((prev) => prev + 1);
      return;
    }
    if (relativeTop < 0) {
      const targetLine = pos.lineIndex;
      setCurrentLineOffset(Math.max(0, targetLine));
      return;
    }
  }, [wordPositions, currentWordIndex, currentLineOffset, visibleLines]);

  // caret offset measured for current typed string
  const caretOffsetForCurrent = useMemo(() => {
    const m = measurerRef.current;
    if (!m || !mounted) return 0;
    try {
      // measure substring up to caret (current word's typed content)
      m.textContent = currentInput ?? "";
      return m.offsetWidth || 0;
    } catch {
      return 0;
    }
  }, [currentInput, mounted, containerWidth, currentWordIndex]);

  const renderWord = (pos: WordPosition) => {
    const { word, index } = pos;
    const top = pos.y - currentLineOffset * LINE_PX;
    const style: React.CSSProperties = {
      position: "absolute",
      left: pos.x,
      top,
      whiteSpace: "pre",
      fontSize: `${FONT_PX}px`,
      lineHeight: `${LINE_PX}px`,
      letterSpacing: `${LETTER_SPACING}px`,
    };

    if (index < currentWordIndex) {
      const typed = completedInputs[index] ?? "";
      return (
        <span
          key={index}
          className="inline-flex items-center whitespace-pre"
          style={style}
        >
          {word.split("").map((ch, ci) => {
            const typedCh = typed[ci];
            const isCorrect = typedCh !== undefined && typedCh === ch;
            return (
              <span
                key={ci}
                className={undefined}
                style={{
                  display: "inline-block",
                  color: isCorrect
                    ? "#ffffff" // completed & correct: mid-contrast
                    : typedCh !== undefined
                    ? "#ef4444" // red-500 for wrong characters
                    : "rgba(255,255,255,0.45)", // fallback if weird
                }}
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

    if (index === currentWordIndex) {
      const typed = currentInput ?? "";
      const chars = word.split("");
      const extras =
        typed.length > chars.length ? typed.slice(chars.length) : "";

      // has the user typed at least one character for this word?
      const hasStartedTyping = typed.length > 0;

      return (
        <span
          key={index}
          className="inline-flex items-center whitespace-pre"
          style={style}
        >
          {chars.map((ch, ci) => {
            const typedCh = typed[ci];
            const isCorrect = typedCh !== undefined && typedCh === ch;

            // If user hasn't started typing this word, render every char faint.
            if (!hasStartedTyping) {
              return (
                <span
                  key={ci}
                  style={{
                    display: "inline-block",
                    color: "rgba(255, 255, 255, 0.25)", // faint until typing begins
                  }}
                >
                  {ch}
                </span>
              );
            }

            // User has started typing: only typed chars should be highlighted.
            // Untyped chars remain faint.
            if (typedCh !== undefined) {
              // typed character: show correct or error color
              return (
                <span
                  key={ci}
                  style={{
                    display: "inline-block",
                    color: isCorrect
                      ? "#ffffff" // typed & correct: almost white
                      : "#ef4444", // typed & wrong: red
                  }}
                >
                  {ch}
                </span>
              );
            } else {
              // not yet typed character in the active word: keep faint
              return (
                <span
                  key={ci}
                  style={{
                    display: "inline-block",
                    color: "rgba(255, 255, 255, 0.25)", // stays faint
                  }}
                >
                  {ch}
                </span>
              );
            }
          })}

          {extras.length > 0 &&
            extras.split("").map((ex, ei) => (
              <span
                key={"extra-cur-" + ei}
                style={{
                  display: "inline-block",
                  overflow: "hidden",
                  maxWidth: "20px",
                  fontSize: "0.9em",
                  color: "#ef4444",
                }}
              >
                {ex}
              </span>
            ))}
        </span>
      );
    }

    return (
      <span
        key={index}
        className="inline-flex items-center  whitespace-pre"
        style={{
          ...style,
          color: "rgba(255, 255, 255, 0.25)", // faint untyped words
        }}
      >
        {word}
      </span>
    );
  };

  if (!mounted) {
    return (
      <div className="w-full mx-auto h-32 flex items-center justify-center">
        <div className="text-neutral-400">Loading words...</div>
      </div>
    );
  }

  const currentPos = wordPositions?.[currentWordIndex] ?? null;
  const currentVisible =
    currentPos &&
    (() => {
      const relativeY = currentPos.y - currentLineOffset * LINE_PX;
      return relativeY >= -LINE_PX && relativeY < LINE_PX * visibleLines;
    })();

  return (
    // fill the parent card width so parent controls left/right padding
    <div className="w-full" ref={containerRef}>
      <div
        className="relative overflow-hidden "
        style={{
          height: LINE_PX * visibleLines,
          fontSize: `${FONT_PX}px`,
          lineHeight: `${LINE_PX}px`,
          letterSpacing: `${LETTER_SPACING}px`,
          transition: "transform .14s ease",
          boxSizing: "border-box",
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

        {currentVisible && currentPos && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: currentPos.x + caretOffsetForCurrent,
              top: currentPos.y - currentLineOffset * LINE_PX,
              height: LINE_PX,
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Caret height={Math.round(FONT_PX)} width={2} />
          </div>
        )}
      </div>
    </div>
  );
}

export default WordDisplay;
