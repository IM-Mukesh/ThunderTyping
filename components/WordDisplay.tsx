"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
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

/* Configurable layout values */
const FONT_PX = 26;
const LINE_PX = 50;
const WORD_SPACING = 16;
const LETTER_SPACING = 2.4;
const DEFAULT_VISIBLE_LINES = 3;
const DEBOUNCE_MS = 80;

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

  const containerRef = useRef<HTMLDivElement | null>(null);
  const measurerRef = useRef<HTMLSpanElement | null>(null);
  const cleanupRef = useRef(false);
  const resizeObsRef = useRef<ResizeObserver | null>(null);
  const widthDebounceTid = useRef<number | null>(null);

  // Synchronously read container width when needed
  const updateWidth = useCallback(() => {
    if (cleanupRef.current) return;
    const node = containerRef.current;
    if (!node) return;
    const w = Math.floor(node.clientWidth || 0);
    if (w && w !== containerWidth) {
      setContainerWidth(w);
    }
  }, [containerWidth]);

  // Debounced schedule for updateWidth
  const scheduleUpdateWidth = useCallback(() => {
    if (widthDebounceTid.current) {
      window.clearTimeout(widthDebounceTid.current);
    }
    widthDebounceTid.current = window.setTimeout(() => {
      widthDebounceTid.current = null;
      updateWidth();
    }, DEBOUNCE_MS) as unknown as number;
  }, [updateWidth]);

  // Create hidden measurer and ResizeObserver (useLayoutEffect to read layout synchronously)
  useLayoutEffect(() => {
    cleanupRef.current = false;
    setMounted(true);

    // create or sync hidden measurer span
    if (!measurerRef.current) {
      try {
        const span = document.createElement("span");
        span.style.position = "absolute";
        span.style.visibility = "hidden";
        span.style.whiteSpace = "pre";
        span.style.fontSize = `${FONT_PX}px`;
        span.style.lineHeight = `${LINE_PX}px`;
        (span.style as any).fontFamily = "inherit";
        span.style.letterSpacing = `${LETTER_SPACING}px`;
        span.style.pointerEvents = "none";
        span.style.boxSizing = "content-box";
        span.style.left = "-9999px";
        span.style.top = "-9999px";
        document.body.appendChild(span);
        measurerRef.current = span;
      } catch (err) {
        // graceful fallback — measurement will use approximate widths
        // eslint-disable-next-line no-console
        console.warn("[WordDisplay] failed to create measurer", err);
      }
    } else {
      try {
        measurerRef.current.style.fontSize = `${FONT_PX}px`;
        measurerRef.current.style.lineHeight = `${LINE_PX}px`;
        measurerRef.current.style.letterSpacing = `${LETTER_SPACING}px`;
        (measurerRef.current.style as any).fontFamily = "inherit";
        measurerRef.current.style.whiteSpace = "pre";
      } catch (_) {}
    }

    // Setup ResizeObserver if available, otherwise fallback to window resize
    const node = containerRef.current;
    if (node && typeof ResizeObserver !== "undefined") {
      try {
        const ro = new ResizeObserver(() => {
          scheduleUpdateWidth();
        });
        ro.observe(node);
        resizeObsRef.current = ro;
      } catch (err) {
        // If constructing ResizeObserver fails, fallback to window resize
        window.addEventListener("resize", scheduleUpdateWidth);
      }
    } else {
      window.addEventListener("resize", scheduleUpdateWidth);
    }

    // initial read in next rAF after paint
    requestAnimationFrame(() => {
      updateWidth();
    });

    // re-measure when fonts are ready (prevents incorrect initial wrapping)
    try {
      (document as any).fonts?.ready
        ?.then(() => {
          scheduleUpdateWidth();
        })
        .catch(() => {});
    } catch (e) {
      // ignore for older browsers
    }

    return () => {
      cleanupRef.current = true;

      // cleanup ResizeObserver safely (use local var to make TS happy)
      const ro = resizeObsRef.current;
      if (ro && containerRef.current) {
        try {
          ro.unobserve(containerRef.current);
          ro.disconnect();
        } catch (_) {
          /* ignore */
        }
        resizeObsRef.current = null;
      } else {
        window.removeEventListener("resize", scheduleUpdateWidth);
      }

      if (measurerRef.current && measurerRef.current.parentNode) {
        try {
          measurerRef.current.parentNode.removeChild(measurerRef.current);
        } catch (_) {
          /* ignore */
        } finally {
          measurerRef.current = null;
        }
      }

      if (widthDebounceTid.current) {
        window.clearTimeout(widthDebounceTid.current);
        widthDebounceTid.current = null;
      }
    };
    // empty deps so it runs once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset offset for new test
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
      m.textContent = currentInput ?? "";
      const measured = m.offsetWidth;
      return measured && measured > 0
        ? measured
        : fallbackWidthFor(currentInput ?? "");
    } catch {
      return fallbackWidthFor(currentInput ?? "");
    }
  }, [currentInput, mounted, containerWidth]);

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

  // Scroll logic to keep current line visible
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

  const caretOffsetForCurrent = useMemo(() => {
    const m = measurerRef.current;
    if (!m || !mounted) return 0;
    try {
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

    // Already completed word rendering (per-char coloring based on completedInputs)
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
                style={{
                  display: "inline-block",
                  color: isCorrect
                    ? "#ffffff"
                    : typedCh !== undefined
                    ? "#ef4444"
                    : "rgba(255,255,255,0.45)",
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

    // Current active word: render typed vs untyped characters
    if (index === currentWordIndex) {
      const typed = currentInput ?? "";
      const chars = word.split("");
      const extras =
        typed.length > chars.length ? typed.slice(chars.length) : "";

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

            if (!hasStartedTyping) {
              return (
                <span
                  key={ci}
                  style={{
                    display: "inline-block",
                    color: "rgba(255, 255, 255, 0.25)",
                  }}
                >
                  {ch}
                </span>
              );
            }

            if (typedCh !== undefined) {
              return (
                <span
                  key={ci}
                  style={{
                    display: "inline-block",
                    color: isCorrect ? "#ffffff" : "#ef4444",
                  }}
                >
                  {ch}
                </span>
              );
            } else {
              return (
                <span
                  key={ci}
                  style={{
                    display: "inline-block",
                    color: "rgba(255, 255, 255, 0.25)",
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

    // Future/untyped words
    return (
      <span
        key={index}
        className="inline-flex items-center whitespace-pre"
        style={{
          ...style,
          color: "rgba(255, 255, 255, 0.25)",
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
    <div className="w-full min-w-0" ref={containerRef}>
      <div
        className="relative overflow-hidden"
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
