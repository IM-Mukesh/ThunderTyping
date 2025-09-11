// ClientPage.tsx
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useClientOnly } from "@/hooks/useClientOnly";
import { ThunderLoader, ThunderLogo } from "@/components/ThunderLogo";
import Link from "next/link";

const TypingTest = dynamic(() => import("@/components/TypingTest"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full">
      <ThunderLoader />
    </div>
  ),
});

export default function ClientPage() {
  const isClient = useClientOnly();
  const [storedDuration, setStoredDuration] = useLocalStorage<number>(
    "typing.duration",
    60
  );
  const [currentDuration, setCurrentDuration] =
    useState<number>(storedDuration);

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

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-950 to-black flex items-center justify-center">
        <ThunderLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-950 to-black flex flex-col items-center justify-center">
      {/* Centered logo + text */}
      <header className="fixed top-6 left-1/2 transform -translate-x-1/2 w-full max-w-6xl z-[60]">
        <Link href="/" className="flex items-center gap-3 justify-center">
          <ThunderLogo size={42} className="block" />
          <span className="font-bold text-2xl">ThunderTyping</span>
        </Link>
      </header>

      {/* TypingTest in center below logo */}
      <div className="w-full max-w-6xl px-6 pb-20 flex-1 flex items-center justify-center">
        <TypingTest
          duration={currentDuration}
          onDurationChange={handleDurationChange}
        />
      </div>
    </div>
  );
}
