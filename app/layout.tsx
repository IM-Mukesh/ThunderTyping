// app/layout.tsx
import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Suspense, useEffect } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThunderLoader } from "@/components/ThunderLogo";
import AnalyticsClient from "@/components/AnalyticsClient";
import Providers from "./providers";
import ReduxProvider from "@/components/ReduxProvider";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://thundertyping.com";
const SITE_NAME = "ThunderTyping";
const SITE_DESCRIPTION =
  "ThunderTyping: fastest, most accurate online typing test. Take an English typing test to check WPM and improve typing speed and accuracy instantly.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  generator: "ThunderTyping",
  applicationName: SITE_NAME,
  keywords: [
    "English typing test",
    "typing test",
    "online typing test",
    "typing speed",
    "typing practice",
    "speed typing test",
    "best typing site",
    "typing games",
    "free typing test",
    "typing games",
    "fast typing test",
    "typing test English",
    "typing challenge",
    "improve typing speed",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    url: SITE_URL,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/logo.png`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/logo.png`],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

// Env vars
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const DEBUG_ANALYTICS = process.env.NEXT_PUBLIC_DEBUG_ANALYTICS === "1";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isProd = process.env.NODE_ENV === "production";

  // Only mount analytics in production OR when debug flag is enabled
  const shouldMountAnalytics = Boolean(GA_ID) && (isProd || DEBUG_ANALYTICS);

  if (typeof window !== "undefined") {
    // 👇 Log GA_ID to console in browser (helps verify env on production)
    console.log("[RootLayout] GA_ID =", GA_ID || "undefined");
    console.log("[RootLayout] NODE_ENV =", process.env.NODE_ENV);
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
    >
      <head>
        {/* Preload important images */}
        <link rel="preload" href="/logo.png" as="image" />

        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="msapplication-TileImage" content="/icon-512.png" />
        <meta name="theme-color" content="#0f172a" />

        <link rel="canonical" href={SITE_URL} />

        {/* Organization JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: SITE_NAME,
              url: SITE_URL,
              logo: `${SITE_URL}/logo.png`,
            }),
          }}
        />
      </head>

      <body className="font-sans overflow-auto">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <ReduxProvider>
              <Suspense fallback={<ThunderLoader />}>
                {children}

                {shouldMountAnalytics ? (
                  <AnalyticsClient
                    gaId={GA_ID}
                    debugMode={!isProd && DEBUG_ANALYTICS}
                  />
                ) : null}
              </Suspense>
            </ReduxProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
