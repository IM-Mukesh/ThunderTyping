// app/settings/page.tsx (App Router)
import { Metadata } from "next";
import SettingsClient from "./SettingsClient";

// SEO Metadata (Server Component)
export const metadata: Metadata = {
  title: "Settings - ThunderTyping | Customize Your Typing Experience",
  description:
    "Personalize your ThunderTyping experience with custom themes, colors, and language preferences. Optimize your typing test environment.",
  keywords:
    "typing test settings, typing game customization, typing practice preferences, keyboard themes, typing speed settings",
  openGraph: {
    title: "Settings - ThunderTyping",
    description:
      "Customize your typing experience with themes, colors, and language preferences",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Settings - ThunderTyping",
    description:
      "Customize your typing experience with themes, colors, and language preferences",
  },
};

// Server Component for metadata and SEO
export default function SettingsPage() {
  return (
    <>
      {/* SEO structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "ThunderTyping Settings",
            description:
              "Customize your typing test experience with personalized themes, colors, and language preferences",
            isPartOf: {
              "@type": "WebSite",
              name: "ThunderTyping",
              description:
                "Advanced typing test platform for speed and accuracy improvement",
            },
          }),
        }}
      />

      <SettingsClient />
    </>
  );
}
