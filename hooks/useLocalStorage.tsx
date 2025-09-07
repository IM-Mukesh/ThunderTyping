"use client";

import { useState } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Failed to load localStorage key "${key}":`, error);
      if (typeof window !== "undefined" && window.console) {
        console.error(`Unable to load saved ${key}. Using default value.`);
      }
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Failed to save localStorage key "${key}":`, error);
      if (typeof window !== "undefined" && window.console) {
        console.error(`Unable to save ${key}. Changes may not persist.`);
      }
    }
  };

  return [storedValue, setValue];
}
