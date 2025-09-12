// components/AnalyticsClient.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type Props = {
  gaId: string;
};

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Simple client component that triggers a page_view on route change.
 * Keeps event calls guarded so duplicates don't flood GA.
 */
export default function AnalyticsClient({ gaId }: Props) {
  const pathname = usePathname();

  useEffect(() => {
    if (!gaId) return;
    // ensure gtag exists
    if (typeof window === "undefined") return;

    // fire a config call which records a page_view
    if (window.gtag) {
      window.gtag("config", gaId, {
        page_path: pathname,
      });
    } else {
      // very small fallback: push to dataLayer if present
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "page_view",
        page_path: pathname,
      });
    }
  }, [pathname, gaId]);

  return null;
}
