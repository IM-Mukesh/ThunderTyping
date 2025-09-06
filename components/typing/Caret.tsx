"use client";

import React from "react";

interface CaretProps {
  /** Height of the caret in pixels (default matches WordDisplay line height) */
  height?: number;
  /** Width of the caret in pixels */
  width?: number;
  /** Whether the caret should animate (blink). Default true. */
  animate?: boolean;
  /** Optional additional classes */
  className?: string;
  /** Optional aria-hidden (defaults to true) */
  ariaHidden?: boolean;
}

/**
 * Gradient caret used in the typing area.
 * Matches the ThunderTyping navbar gradient: cyan -> blue.
 *
 * Usage:
 * <Caret height={24} width={2} />
 */
export function Caret({
  height = 24,
  width = 2,
  animate = true,
  className = "",
  ariaHidden = true,
}: CaretProps) {
  const baseStyle: React.CSSProperties = {
    width,
    height,
    borderRadius: 1,
    // ensure it doesn't shift layout
    display: "inline-block",
    verticalAlign: "middle",
    // fallback background if Tailwind classes not available
    background:
      "linear-gradient(90deg, rgb(34 211 238) 0%, rgb(59 130 246) 100%)",
  };

  return (
    <span
      aria-hidden={ariaHidden}
      className={`inline-block align-middle ${
        animate ? "animate-caret" : ""
      } ${className}`}
      style={baseStyle}
    />
  );
}

export default Caret;
