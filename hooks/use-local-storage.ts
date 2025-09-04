"use client";

import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [isClient, setIsClient] = useState(false);

  // Set client flag after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load from localStorage after client mount
  useEffect(() => {
    if (!isClient) return;

    try {
      const raw = localStorage.getItem(key);
      if (raw != null) {
        const parsed = JSON.parse(raw);
        setValue(parsed);
      }
    } catch (error) {
      console.warn(`Failed to load localStorage key "${key}":`, error);
    }
  }, [key, isClient]);

  // Save to localStorage on value changes (only on client)
  useEffect(() => {
    if (!isClient) return;

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Failed to save localStorage key "${key}":`, error);
    }
  }, [key, value, isClient]);

  return [value, setValue] as const;
}
