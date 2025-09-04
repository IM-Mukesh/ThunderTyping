"use client";

import { memo, useEffect, useRef, useState } from "react";
import type React from "react";
import { cn } from "@/lib/utils";

type WordRendererProps = {
  words: string[];
  currentWordIndex: number;
  currentInput: string;
  cursorIndex: number;
  mistakesInWord: Set<number>;
  completedStatuses: ("pending" | "correct" | "incorrect")[];
  caretRef?: React.RefObject<HTMLSpanElement | null>;
};

function Caret({
  caretRef,
}: {
  caretRef?: React.RefObject<HTMLSpanElement | null>;
}) {
  return (
    <span
      ref={caretRef}
      aria-hidden
      className="inline-block h-[1.2em] w-[1px] translate-y-[0.1em] bg-cyan-400 align-text-top caret-blink"
    />
  );
}

export const WordRenderer = memo(function WordRenderer({
  words,
  currentWordIndex,
  currentInput,
  cursorIndex,
  mistakesInWord,
  completedStatuses,
  caretRef,
}: WordRendererProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = useState<number>(28);
  const [scrolledLines, setScrolledLines] = useState(0);

  // measure line-height to compute exactly 3 visible lines
  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;

    const getLH = () => {
      // Double-check the element still exists
      if (!viewportRef.current) return;
      const cs = getComputedStyle(viewportRef.current);
      const v = Number.parseFloat(cs.lineHeight || "28");
      if (Number.isFinite(v) && v > 0) setLineHeight(v);
    };

    getLH();
    const ro = new ResizeObserver(() => {
      // Check if element still exists before calling getLH
      if (viewportRef.current) {
        getLH();
      }
    });
    ro.observe(element);
    return () => ro.disconnect();
  }, []);

  // auto-scroll: once the caret enters the 3rd visible line, scroll up so there are always 3 lines
  useEffect(() => {
    if (!caretRef?.current || !viewportRef.current) return;
    const caretBox = caretRef.current.getBoundingClientRect();
    const vpBox = viewportRef.current.getBoundingClientRect();
    const relTop = caretBox.top - vpBox.top;
    const visibleLine = Math.floor(relTop / lineHeight);
    if (visibleLine >= 2) {
      // move enough so caret comes back to second line
      setScrolledLines((prev) => prev + (visibleLine - 1));
    }
  }, [currentInput, currentWordIndex, cursorIndex, lineHeight, caretRef]);

  return (
    <div
      suppressHydrationWarning
      ref={viewportRef}
      className="relative mx-auto max-w-3xl select-none whitespace-pre-wrap rounded-lg border border-neutral-800 bg-neutral-950/60 p-6 text-lg leading-7 text-neutral-500 overflow-hidden shadow-2xl"
      aria-live="off"
      role="region"
      aria-label="Typing text"
      style={{ height: `${Math.round(lineHeight * 3)}px` }}
    >
      <style>{`
        @keyframes caretBlink { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
        .caret-blink { animation: caretBlink 1s step-start infinite }
      `}</style>

      <div
        ref={innerRef}
        className="will-change-transform transition-transform duration-200 ease-out"
        style={{ transform: `translateY(-${scrolledLines * lineHeight}px)` }}
      >
        <p className="text-pretty">
          {words.map((word, wi) => {
            const isCurrent = wi === currentWordIndex;
            const status = completedStatuses[wi] || "pending";
            return (
              <span
                key={wi}
                className={cn(
                  "mb-2 mr-2 inline-block rounded-md px-1",
                  // isCurrent && "ring-1 ring-cyan-400/40 bg-neutral-900",
                  !isCurrent && status === "correct" && "text-neutral-400",
                  !isCurrent && status === "incorrect" && "text-amber-400"
                )}
                aria-current={isCurrent ? "true" : undefined}
              >
                {isCurrent ? (
                  <span>
                    {Array.from(word).map((ch, i) => {
                      const typed = currentInput[i];
                      const hasTyped = i < currentInput.length;
                      const isMistake = mistakesInWord.has(i);
                      const showCaretBefore = i === cursorIndex;
                      return (
                        <span key={i} className="relative">
                          {showCaretBefore && <Caret caretRef={caretRef} />}
                          <span
                            className={cn(
                              // Default grey for untyped characters
                              !hasTyped && "text-neutral-500",
                              // White for correctly typed characters
                              hasTyped && !isMistake && "text-neutral-200",
                              // Amber for mistakes
                              isMistake &&
                                "text-amber-400/90 underline decoration-amber-400/40"
                            )}
                          >
                            {typed ?? ch}
                          </span>
                        </span>
                      );
                    })}
                    {currentInput.length > word.length &&
                      Array.from(currentInput.slice(word.length)).map(
                        (extra, j) => {
                          const idx = word.length + j;
                          const showCaretBefore = idx === cursorIndex;
                          return (
                            <span
                              key={idx}
                              className="relative text-amber-400/90"
                            >
                              {showCaretBefore && <Caret caretRef={caretRef} />}
                              {extra}
                            </span>
                          );
                        }
                      )}
                    {cursorIndex >=
                      Math.max(currentInput.length, word.length) && (
                      <Caret caretRef={caretRef} />
                    )}
                  </span>
                ) : (
                  <span>{word}</span>
                )}
              </span>
            );
          })}
        </p>
      </div>
    </div>
  );
});
