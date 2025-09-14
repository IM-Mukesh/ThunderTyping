// components/KeyboardHint.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { RefreshCcw } from "lucide-react";

interface KeyboardHintProps {
  className?: string;
  label?: React.ReactNode;
  onRestart?: () => void;
  /** breakpoint (px) to consider "mobile" — default 768 (Tailwind md) */
  mobileBreakpoint?: number;
}

export default function KeyboardHint({
  className = "",
  label,
  onRestart,
  mobileBreakpoint = 768,
}: KeyboardHintProps) {
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.innerWidth < mobileBreakpoint : false
  );

  // Debounced resize handler
  useEffect(() => {
    if (typeof window === "undefined") return;
    let tid: number | null = null;
    const onResize = () => {
      if (tid) window.clearTimeout(tid);
      tid = window.setTimeout(() => {
        setIsMobile(window.innerWidth < mobileBreakpoint);
        tid = null;
      }, 120);
    };
    window.addEventListener("resize", onResize);
    // also handle orientationchange (mobile rotate)
    window.addEventListener("orientationchange", onResize);
    return () => {
      if (tid) window.clearTimeout(tid);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [mobileBreakpoint]);

  const handleClick = useCallback(() => {
    if (typeof onRestart === "function") {
      onRestart();
      return;
    }
    try {
      window.location.reload();
    } catch {
      /* ignore */
    }
  }, [onRestart]);

  // position above footer which should set --footer-height; fallback 64px
  const bottomOffset = "calc(var(--footer-height, 64px) + 12px)";

  // Desktop pill (only shown when NOT mobile)
  const DesktopPill = (
    <div
      aria-hidden
      className={`fixed z-40 left-1/2 transform -translate-x-1/2 ${className}`}
      style={{ bottom: bottomOffset }}
    >
      <div
        className="relative flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 backdrop-blur-md px-3 py-2 rounded-full whitespace-nowrap"
        role="note"
      >
        <span className="font-mono text-slate-300">Tab</span>
        <span className="text-slate-500">+</span>
        <span className="font-mono text-slate-300">Enter</span>
        <span className="text-slate-500">-</span>
        <span className="text-slate-300">{label ?? "Restart test"}</span>
      </div>
    </div>
  );

  // Mobile refresh icon (transparent background, pointer cursor)
  const MobileIcon = (
    <button
      onClick={handleClick}
      aria-label="Restart test"
      className={`fixed z-40 left-1/2 transform -translate-x-1/2 ${className}`}
      style={{
        bottom: bottomOffset,
        width: 44,
        height: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
      }}
    >
      <RefreshCcw size={20} className="text-slate-200" />
    </button>
  );

  return <>{isMobile ? MobileIcon : DesktopPill}</>;
}
