"use client";

import { useState } from "react";
import { NavBar } from "@/components/navbar";
import { TypingTest } from "@/components/typing-test";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useClientOnly } from "@/hooks/use-client-only";

export default function ClientPage() {
  const isClient = useClientOnly();
  const [storedDuration, setStoredDuration] = useLocalStorage(
    "typing.duration",
    60
  );
  const [currentDuration, setCurrentDuration] = useState(storedDuration);

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
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-950 to-black">
      <NavBar />
      <TypingTest
        duration={currentDuration}
        onDurationChange={handleDurationChange}
      />
    </div>
  );
}
