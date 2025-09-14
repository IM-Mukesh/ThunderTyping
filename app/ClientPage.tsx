// ClientPage.tsx
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useClientOnly } from "@/hooks/useClientOnly";
import { ThunderLoader } from "@/components/ThunderLogo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-950 to-black flex flex-col items-center justify-center bg-white">
      {/* Reusable Header */}
      <Header />

      {/* TypingTest in center below logo - updated to use more width */}
      <div className="w-[95%] sm:w-[92%] md:w-[88%] lg:w-[85%] xl:w-[82%] 2xl:w-[78%] max-w-[1600px] pb-20 flex-1 flex items-center justify-center">
        <TypingTest
          duration={currentDuration}
          onDurationChange={handleDurationChange}
        />
      </div>
      <Footer />
    </div>
  );
}
