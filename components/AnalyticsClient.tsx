// components/AnalyticsClient.tsx
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type Props = {
  gaId?: string;
  /**
   * If true, will only load analytics after explicit user consent stored in
   * localStorage as "analytics-consent" === "granted". Default: false.
   */
  requireConsent?: boolean;
};

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * AnalyticsClient
 * - Defers loading gtag.js until browser is idle or window load (non-blocking).
 * - Initializes window.dataLayer and window.gtag if needed.
 * - Sends page_view / config on route changes.
 *
 * NOTE: We intentionally do NOT redeclare requestIdleCallback; instead we use
 * a safe cast when calling it to avoid conflicting with lib.dom types.
 */
export default function AnalyticsClient({
  gaId,
  requireConsent = false,
}: Props) {
  const pathname = usePathname();
  const loadedRef = useRef(false);

  const hasConsent = (): boolean => {
    if (!requireConsent) return true;
    try {
      return localStorage.getItem("analytics-consent") === "granted";
    } catch {
      return false;
    }
  };

  // Inject gtag.js in a deferred way (idle/load)
  useEffect(() => {
    if (!gaId) return;
    if (typeof window === "undefined") return;
    if (loadedRef.current) return;
    if (!hasConsent()) return;

    const w = window as unknown as any; // safe cast to call non-standard methods

    function initGtag() {
      // If gtag already exists, mark loaded and exit
      if (w.gtag) {
        loadedRef.current = true;
        return;
      }

      // create and append the gtag script
      const script = document.createElement("script");
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      script.async = true;
      document.head.appendChild(script);

      // init dataLayer / gtag stub
      w.dataLayer = w.dataLayer || [];
      function gtag(...args: any[]) {
        w.dataLayer!.push(args);
      }
      w.gtag = gtag;

      // initial config records first page view
      try {
        w.gtag("js", new Date());
        w.gtag("config", gaId, { page_path: w.location.pathname });
      } catch {
        // never throw from analytics
      }

      loadedRef.current = true;
    }

    // Use requestIdleCallback if available on the platform — cast to any to avoid TS signature mismatch
    try {
      if (typeof (w as any).requestIdleCallback === "function") {
        (w as any).requestIdleCallback(
          () => {
            try {
              initGtag();
            } catch {
              /* swallow */
            }
          },
          { timeout: 2000 }
        );
      } else {
        // fallback: wait for load event to avoid interfering with LCP
        const onLoad = () => {
          try {
            initGtag();
          } catch {
            /* swallow */
          }
          (w as Window & typeof globalThis).removeEventListener("load", onLoad);
        };
        (w as Window & typeof globalThis).addEventListener("load", onLoad);
      }
    } catch {
      // if anything goes wrong, fallback to load event listener
      const onLoad = () => {
        try {
          initGtag();
        } catch {
          /* swallow */
        }
        (w as Window & typeof globalThis).removeEventListener("load", onLoad);
      };
      (w as Window & typeof globalThis).addEventListener("load", onLoad);
    }
  }, [gaId, requireConsent]);

  // Send page view / config on route change
  useEffect(() => {
    if (!gaId) return;
    if (typeof window === "undefined") return;
    if (requireConsent && !hasConsent()) return;

    const w = window as unknown as any;

    if (w.gtag) {
      try {
        w.gtag("config", gaId, { page_path: pathname });
      } catch {
        /* swallow */
      }
    } else {
      // fallback for GTM/dataLayer
      w.dataLayer = w.dataLayer || [];
      try {
        w.dataLayer.push({
          event: "page_view",
          page_path: pathname,
        });
      } catch {
        /* swallow */
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, gaId, requireConsent]);

  return null;
}
