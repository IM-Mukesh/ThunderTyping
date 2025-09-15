// app/settings/SettingsClient.tsx
"use client";

import dynamic from "next/dynamic";
import { useClientOnly } from "@/hooks/useClientOnly";
import { ThunderLoader } from "@/components/ThunderLogo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Dynamically import the settings component to avoid SSR issues
const SettingsComponent = dynamic(() => import("@/components/SettingsPage"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full min-h-[400px]">
      <ThunderLoader />
    </div>
  ),
});

export default function SettingsClient() {
  const isClient = useClientOnly();

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-950 to-black flex items-center justify-center">
        <ThunderLoader />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-neutral-900 via-neutral-950 to-black flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Settings Content */}
      <main className="flex-1 mt-[80px] 2xl:mt-[120px]">
        <SettingsComponent />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
