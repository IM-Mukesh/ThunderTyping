"use client";

import type React from "react";
import { useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";

const XIcon = () => (
  <svg
    className="size-5 text-neutral-300"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

interface ResultsModalProps {
  open: boolean;
  onClose: () => void;
  onRetry: () => void;
  onNewTest: () => void;
  // Updated to use the new results structure
  grossWpm: number;
  netWpm: number;
  accuracy: number; // 0..1
  correctChars: number;
  totalChars: number;
  correctWords: number;
  totalWords: number;
  duration: number; // seconds
}

export function ResultsModal({
  open,
  onClose,
  onRetry,
  onNewTest,
  grossWpm,
  netWpm,
  accuracy,
  correctChars,
  totalChars,
  correctWords,
  totalWords,
  duration,
}: ResultsModalProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Track Tab+Enter combination
  const tabDown = useRef(false);
  const enterDown = useRef(false);

  // Compute incorrect characters and words
  const incorrectChars = Math.max(0, totalChars - correctChars);
  const incorrectWords = Math.max(0, totalWords - correctWords);

  // When modal opens: save previously focused element & move focus to dialog
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const timer = setTimeout(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = dialog.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable) focusable.focus();
      else dialog.focus();
    }, 0);

    return () => clearTimeout(timer);
  }, [open]);

  // Restore focus when modal closes
  useEffect(() => {
    if (open) return;
    const prev = previouslyFocused.current;
    if (prev && typeof prev.focus === "function") {
      prev.focus();
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Focus trap: keep Tab inside dialog
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Tab" && dialogRef.current) {
      const dialog = dialogRef.current;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("disabled"));

      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    }

    // Track Tab+Enter combo
    if (e.key === "Tab") tabDown.current = e.type === "keydown";
    if (e.key === "Enter") enterDown.current = e.type === "keydown";
  }, []);

  // Global keyboard listener for Tab+Enter detection
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") tabDown.current = true;
      if (e.key === "Enter") enterDown.current = true;

      if (tabDown.current && enterDown.current) {
        e.preventDefault();
        onRetry();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Tab") tabDown.current = false;
      if (e.key === "Enter") enterDown.current = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      tabDown.current = false;
      enterDown.current = false;
    };
  }, [open, onRetry]);

  // Click outside to close
  const handleOverlayMouseDown = (e: React.MouseEvent) => {
    if (!overlayRef.current) return;
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={handleOverlayMouseDown}
      aria-hidden={!open}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="typing-results-title"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2
              id="typing-results-title"
              className="text-2xl font-bold text-white"
            >
              Results
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Duration:{" "}
              {duration >= 60
                ? `${Math.floor(duration / 60)}m ${duration % 60}s`
                : `${duration}s`}
            </p>
          </div>

          <button
            aria-label="Close results"
            onClick={onClose}
            className="rounded-md p-2 hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <XIcon />
          </button>
        </div>

        {/* Primary metrics */}
        <div className="grid grid-cols-3 gap-4 mt-6 mb-4">
          <div className="rounded-lg bg-neutral-800/50 p-3 text-center">
            <div className="text-xs text-neutral-400">Net WPM</div>
            <div className="text-3xl font-mono font-bold text-cyan-400">
              {netWpm}
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              (Gross: {grossWpm})
            </div>
          </div>

          <div className="rounded-lg bg-neutral-800/50 p-3 text-center">
            <div className="text-xs text-neutral-400">Accuracy</div>
            <div className="text-3xl font-mono font-bold text-white">
              {Math.round(accuracy * 100)}%
            </div>
          </div>

          <div className="rounded-lg bg-neutral-800/50 p-3 text-center">
            <div className="text-xs text-neutral-400">Characters</div>
            <div className="text-sm font-mono font-semibold">
              <div className="text-green-400">{correctChars}</div>
              <div className="text-red-400">{incorrectChars}</div>
            </div>
          </div>
        </div>

        {/* Detailed statistics */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-400">Total characters</span>
            <span className="font-mono text-white">{totalChars}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-400">Correct characters</span>
            <span className="font-mono text-green-400">{correctChars}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-400">Incorrect characters</span>
            <span className="font-mono text-red-400">{incorrectChars}</span>
          </div>

          {totalWords > 0 && (
            <>
              <hr className="border-neutral-700" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Words completed</span>
                <span className="font-mono text-white">{totalWords}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Correct words</span>
                <span className="font-mono text-green-400">{correctWords}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Incorrect words</span>
                <span className="font-mono text-red-400">{incorrectWords}</span>
              </div>
            </>
          )}
        </div>

        {/* WPM explanation */}
        {/* <div className="bg-neutral-800/30 rounded-lg p-3 mb-4">
          <div className="text-xs text-neutral-400 mb-2">WPM Calculation:</div>
          <div className="text-xs text-neutral-300 space-y-1">
            <div>• Gross WPM = (Total chars ÷ 5) ÷ Time</div>
            <div>• Net WPM = Gross WPM × Accuracy</div>
            <div>• 1 word = 5 characters (including spaces)</div>
          </div>
        </div> */}

        <div className="text-xs text-neutral-500 mb-4 text-center">
          Tip: Press <span className="font-mono">Tab</span> +{" "}
          <span className="font-mono">Enter</span> together to retry quickly.
        </div>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={onRetry}>
            Retry
          </Button>
          <Button onClick={onNewTest}>New Test</Button>
        </div>
      </div>
    </div>
  );
}

export default ResultsModal;
