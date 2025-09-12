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
    if (typeof window === "undefined") return;

    // Debugging hints (only logs in dev console)
    // Remove or comment these if you don't want console noise.
    // They help confirm whether gtag/dataLayer exist on route changes.
    // NOTE: these logs appear in the client console only.
    // eslint-disable-next-line no-console
    console.debug("[AnalyticsClient] gaId:", gaId, "pathname:", pathname);

    // fire a config call which records a page_view
    if (window.gtag) {
      // eslint-disable-next-line no-console
      console.debug("[AnalyticsClient] gtag found — sending config");
      window.gtag("config", gaId, {
        page_path: pathname,
      });
    } else {
      // fallback: push to dataLayer if present (GTM users may rely on this)
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "page_view",
        page_path: pathname,
      });
      // eslint-disable-next-line no-console
      console.debug("[AnalyticsClient] pushed page_view to dataLayer", {
        page_path: pathname,
      });
    }
  }, [pathname, gaId]);

  return null;
}
