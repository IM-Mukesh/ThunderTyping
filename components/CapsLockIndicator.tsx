import React, { useEffect, useRef, useState } from "react";

export default function CapsLockIndicator({
  className = "",
  hideOnBlur = true, // optional: hide when window/tab loses focus
}: {
  className?: string;
  hideOnBlur?: boolean;
}) {
  const [capsOn, setCapsOn] = useState(false);
  const lastKnown = useRef<boolean>(false);

  useEffect(() => {
    // Helper to update from an incoming KeyboardEvent (if available)
    const updateFromEvent = (e?: KeyboardEvent) => {
      try {
        if (e && typeof e.getModifierState === "function") {
          const isOn = Boolean(e.getModifierState("CapsLock"));
          lastKnown.current = isOn;
          setCapsOn(isOn);
          return;
        }
      } catch {
        // ignore and fallback
      }
      // If no event (e.g. focus/visibility), keep previous known state.
      setCapsOn(lastKnown.current);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // If user pressed the CapsLock key itself, toggle the state immediately
      if (e.key === "CapsLock" || e.code === "CapsLock") {
        // toggle based on previous known (safe)
        lastKnown.current = !lastKnown.current;
        setCapsOn(lastKnown.current);
        return;
      }
      // Otherwise try to read modifier state from the event
      updateFromEvent(e);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      updateFromEvent(e);
    };

    const onVisibilityChange = () => {
      // When user switches back to tab, keep last known state (can't reliably detect)
      setCapsOn(lastKnown.current);
    };

    const onFocus = () => {
      // When window regains focus, keep last known state — it will update on next key event.
      setCapsOn(lastKnown.current);
    };

    const onBlur = () => {
      if (hideOnBlur) {
        // Hide indicator on blur to avoid sticky UI when user switches apps
        setCapsOn(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);

    // cleanup
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  }, [hideOnBlur]);

  if (!capsOn) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`tt-caps-indicator ${className}`}
      style={{
        position: "fixed",
        right: 16,
        top: 16,
        zIndex: 9999,
        padding: "6px 10px",
        borderRadius: 8,
        boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
        background: "#fff7cc",
        color: "#663c00",
        fontWeight: 700,
        fontSize: 13,
        display: "flex",
        gap: 8,
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        aria-hidden
        focusable="false"
      >
        <path fill="currentColor" d="M12 3L2 13h3v6h6v-4h2v4h6v-6h3z" />
      </svg>
      Caps Lock On
    </div>
  );
}
