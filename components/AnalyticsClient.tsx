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
  /**
   * Enables detailed debug logging and allows loading in development when true.
   * You can set via env: NEXT_PUBLIC_DEBUG_ANALYTICS=1 and pass debugMode={true}
   * from layout.tsx (the updated layout does that automatically when env=1).
   */
  debugMode?: boolean;
};

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

export default function AnalyticsClient({
  gaId,
  requireConsent = false,
  debugMode = false,
}: Props) {
  const pathname = usePathname();
  const loadedRef = useRef(false);

  const isClient = typeof window !== "undefined";

  const hasConsent = (): boolean => {
    if (!requireConsent) return true;
    try {
      return localStorage.getItem("analytics-consent") === "granted";
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!gaId) {
      if (debugMode) console.warn("[AnalyticsClient] no gaId provided");
      return;
    }
    if (!isClient) {
      if (debugMode) console.warn("[AnalyticsClient] not running on client");
      return;
    }
    if (loadedRef.current) {
      if (debugMode) console.debug("[AnalyticsClient] already loaded");
      return;
    }
    if (!hasConsent()) {
      if (debugMode) console.warn("[AnalyticsClient] consent not granted");
      return;
    }

    const w = window as any;

    function initGtag() {
      if (w.gtag) {
        loadedRef.current = true;
        if (debugMode) console.info("[AnalyticsClient] gtag already present");
        return;
      }

      if (debugMode)
        console.info("[AnalyticsClient] injecting gtag.js for", gaId);

      const script = document.createElement("script");
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      script.async = true;
      script.onload = () => {
        if (debugMode)
          console.info("[AnalyticsClient] gtag.js loaded (onload)");
      };
      script.onerror = () => {
        if (debugMode)
          console.error("[AnalyticsClient] failed to load gtag.js");
      };
      document.head.appendChild(script);

      // init dataLayer / gtag stub
      w.dataLayer = w.dataLayer || [];
      function gtag(...args: any[]) {
        w.dataLayer.push(args);
        if (debugMode)
          console.debug("[AnalyticsClient] pushed to dataLayer:", args);
      }
      w.gtag = gtag;

      // initial config records first page view
      try {
        w.gtag("js", new Date());
        w.gtag("config", gaId, { page_path: w.location.pathname });
        if (debugMode) console.info("[AnalyticsClient] initial config pushed");
      } catch (e) {
        if (debugMode)
          console.error("[AnalyticsClient] error during initial gtag calls", e);
      }

      loadedRef.current = true;
    }

    try {
      // Use requestIdleCallback if available (non-standard but safe cast used)
      if (typeof (window as any).requestIdleCallback === "function") {
        (window as any).requestIdleCallback(
          () => {
            try {
              initGtag();
            } catch (e) {
              if (debugMode) console.error(e);
            }
          },
          { timeout: 2000 }
        );
      } else {
        // fallback: wait for load event to avoid interfering with LCP
        const onLoad = () => {
          try {
            initGtag();
          } catch (e) {
            if (debugMode) console.error(e);
          }
          window.removeEventListener("load", onLoad);
        };
        window.addEventListener("load", onLoad);
      }
    } catch (err) {
      if (debugMode)
        console.warn(
          "[AnalyticsClient] requestIdleCallback failed, using load event",
          err
        );
      const onLoad = () => {
        try {
          initGtag();
        } catch (e) {
          if (debugMode) console.error(e);
        }
        window.removeEventListener("load", onLoad);
      };
      window.addEventListener("load", onLoad);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gaId, requireConsent, debugMode]);

  // Send page view / config on route change
  useEffect(() => {
    if (!gaId) return;
    if (!isClient) return;
    if (requireConsent && !hasConsent()) {
      if (debugMode)
        console.debug(
          "[AnalyticsClient] route change ignored, consent missing"
        );
      return;
    }

    const w = window as any;

    if (w.gtag) {
      try {
        w.gtag("config", gaId, { page_path: pathname });
        if (debugMode)
          console.debug("[AnalyticsClient] route config pushed", pathname);
      } catch (e) {
        if (debugMode) console.error("[AnalyticsClient] route config error", e);
      }
    } else {
      w.dataLayer = w.dataLayer || [];
      try {
        w.dataLayer.push({
          event: "page_view",
          page_path: pathname,
        });
        if (debugMode)
          console.debug(
            "[AnalyticsClient] dataLayer page_view pushed",
            pathname
          );
      } catch (e) {
        if (debugMode)
          console.error("[AnalyticsClient] dataLayer push error", e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, gaId, requireConsent]);

  return null;
}
