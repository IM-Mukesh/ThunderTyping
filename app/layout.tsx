// app/layout.tsx
import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThunderLoader } from "@/components/ThunderLogo";
import AnalyticsClient from "@/components/AnalyticsClient";
import Providers from "./providers";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://thundertyping.com";
const SITE_NAME = "ThunderTyping";
const SITE_DESCRIPTION =
  "ThunderTyping is the fastest, most accurate online typing test. Check your WPM with a futuristic, distraction-free design. Improve typing speed and accuracy instantly.";

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
    "typing test",
    "online typing test",
    "WPM test",
    "typing practice",
    "speed typing test",
    "typing speed",
    "best typing site",
    "typing speed test online",
    "free typing test",
    "typing games",
    "fast typing test",
    "typing test English",
    "typing challenge",
    "improve typing speed",
    "keyboard typing test",
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

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isProd = process.env.NODE_ENV === "production";

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
    >
      <head>
        {/* Preload important images */}
        <link rel="preload" href="/logo.png" as="image" />

        {/* Favicons (explicit) */}
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

        {/* Google Analytics - only include in production and when GA_ID is present */}
        {isProd && GA_ID ? (
          <>
            {/* Preconnect to GTM for slightly faster loading */}
            <link rel="preconnect" href="https://www.googletagmanager.com" />
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        ) : null}
      </head>

      {/* NOTE: removed overflow-hidden; use overflow-auto so pages can scroll */}
      <body className="font-sans overflow-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <Suspense fallback={<ThunderLoader />}>
              {children}
              {/* Client-side page view tracking for SPA navigation */}
              {isProd && GA_ID ? <AnalyticsClient gaId={GA_ID} /> : null}
            </Suspense>

            {/* Vercel Analytics (works when enabled in Vercel) */}
            <Analytics />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
