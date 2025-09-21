"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type Props = {
  gaId?: string;
  requireConsent?: boolean;
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

  const hasConsent = (): boolean => {
    if (!requireConsent) return true;
    try {
      return localStorage.getItem("analytics-consent") === "granted";
    } catch {
      return false;
    }
  };

  // Load GA script once
  useEffect(() => {
    if (!gaId) {
      if (debugMode) console.warn("[AnalyticsClient] No GA ID provided");
      return;
    }
    if (loadedRef.current) {
      if (debugMode) console.debug("[AnalyticsClient] Already loaded");
      return;
    }
    if (!hasConsent()) {
      if (debugMode) console.warn("[AnalyticsClient] Consent not granted");
      return;
    }

    if (debugMode) console.info("[AnalyticsClient] Injecting GA for:", gaId);

    // Create script
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script.async = true;
    script.onload = () => {
      if (debugMode) console.info("[AnalyticsClient] gtag.js loaded");
    };
    script.onerror = () => {
      if (debugMode) console.error("[AnalyticsClient] Failed to load gtag.js");
    };
    document.head.appendChild(script);

    // Init dataLayer / gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer!.push(args);
      if (debugMode) console.debug("[AnalyticsClient] gtag push:", args);
    }
    window.gtag = gtag;

    try {
      window.gtag("js", new Date());
      window.gtag("config", gaId, { page_path: window.location.pathname });
      if (debugMode) console.info("[AnalyticsClient] Initial config pushed");
    } catch (e) {
      if (debugMode)
        console.error("[AnalyticsClient] Error during initial gtag call", e);
    }

    loadedRef.current = true;
  }, [gaId, requireConsent, debugMode]);

  // Track route changes
  useEffect(() => {
    if (!gaId) return;
    if (!hasConsent()) {
      if (debugMode)
        console.debug("[AnalyticsClient] Route ignored, no consent");
      return;
    }

    if (window.gtag) {
      try {
        window.gtag("config", gaId, { page_path: pathname });
        if (debugMode)
          console.debug("[AnalyticsClient] Route config pushed", pathname);
      } catch (e) {
        if (debugMode) console.error("[AnalyticsClient] Route config error", e);
      }
    } else {
      window.dataLayer = window.dataLayer || [];
      try {
        window.dataLayer.push({
          event: "page_view",
          page_path: pathname,
        });
        if (debugMode)
          console.debug(
            "[AnalyticsClient] Fallback page_view pushed",
            pathname
          );
      } catch (e) {
        if (debugMode)
          console.error("[AnalyticsClient] Fallback push error", e);
      }
    }
  }, [pathname, gaId, requireConsent, debugMode]);

  return null;
}
