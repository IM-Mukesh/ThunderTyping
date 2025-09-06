"use client";

import { useEffect, useRef } from "react";

/**
 * useKeyCombo
 *
 * Small hook to detect when a set of keys are held together.
 * Example usage:
 *   useKeyCombo(["Tab", "Enter"], (pressed) => { if (pressed) onRetry() });
 *
 * This hook calls `onCombo(true)` when **all** keys become pressed,
 * and `onCombo(false)` when any of them is released.
 */
export function useKeyCombo(
  keys: string[],
  onCombo: (pressed: boolean) => void,
  active = true
) {
  const keyStateRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (!active) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (!keys.includes(e.key)) return;
      keyStateRef.current[e.key] = true;

      const allDown = keys.every((k) => !!keyStateRef.current[k]);
      if (allDown) {
        onCombo(true);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (!keys.includes(e.key)) return;
      keyStateRef.current[e.key] = false;
      // When any key is released, combo is no longer active
      onCombo(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", () => {
      // clear on blur
      keyStateRef.current = {};
      onCombo(false);
    });

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", () => {
        keyStateRef.current = {};
        onCombo(false);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(keys), active]);
}

export default useKeyCombo;
