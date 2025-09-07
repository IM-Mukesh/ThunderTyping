"use client";

import { useEffect, useState } from "react";
import TypingTest from "@/components/TypingTest";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useClientOnly } from "@/hooks/useClientOnly";

export default function ClientPage() {
  const isClient = useClientOnly();
  const [storedDuration, setStoredDuration] = useLocalStorage<number>(
    "typing.duration",
    60
  );
  const [currentDuration, setCurrentDuration] =
    useState<number>(storedDuration);

  // Keep currentDuration in sync when storedDuration loads/changes
  useEffect(() => {
    if (
      typeof storedDuration === "number" &&
      storedDuration !== currentDuration
    ) {
      setCurrentDuration(storedDuration);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedDuration]);

  const handleDurationChange = (newDuration: number) => {
    setCurrentDuration(newDuration);
    setStoredDuration(newDuration);
  };

  // Don't render until client-side
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-950 to-black flex items-center justify-center">
        <div className="text-neutral-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-950 to-black flex items-center justify-center">
      {/* NOTE: No NavBar here — content must match the generated image (clean centered card) */}
      <TypingTest
        duration={currentDuration}
        onDurationChange={handleDurationChange}
      />
    </div>
  );
}
