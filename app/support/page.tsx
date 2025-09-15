// app/support/page.tsx
import type { Metadata } from "next";
import SupportClient from "./SupportClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Support — ThunderTyping",
  description:
    "Get help with ThunderTyping. Browse our FAQ, submit support tickets, and find answers to common questions about our online typing test platform.",
  keywords: [
    "ThunderTyping support",
    "typing test help",
    "FAQ",
    "customer support",
    "troubleshooting",
    "help center",
  ],
  openGraph: {
    title: "Support — ThunderTyping",
    description:
      "Get help with ThunderTyping. Browse our FAQ, submit support tickets, and find answers to common questions.",
    type: "website",
    url: "https://thundertyping.com/support",
    images: [
      {
        url: "/og/support.png", // Replace with actual OG image
        width: 1200,
        height: 630,
        alt: "ThunderTyping Support Center",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Support — ThunderTyping",
    description:
      "Get help with ThunderTyping. Browse our FAQ and submit support tickets.",
    images: ["/og/support.png"],
  },
};

export default function SupportPage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            name: "ThunderTyping Support & FAQ",
            description:
              "Frequently asked questions and support for ThunderTyping online typing test platform.",
            url: "https://thundertyping.com/support",
            mainEntity: [
              {
                "@type": "Question",
                name: "How accurate is the ThunderTyping WPM calculation?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "ThunderTyping uses industry-standard WPM calculation: (characters typed / 5) / (time in minutes). We account for errors to give you precise speed measurements.",
                },
              },
              {
                "@type": "Question",
                name: "Can I track my typing progress over time?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes! Your results are saved locally in your browser. We're working on user accounts for cross-device progress tracking.",
                },
              },
              {
                "@type": "Question",
                name: "What makes ThunderTyping different from other typing tests?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "ThunderTyping features a distraction-free futuristic design, accurate real-time feedback, and smooth animations for an enhanced typing experience.",
                },
              },
            ],
            provider: {
              "@type": "ContactPoint",
              contactType: "Customer Support",
              availableLanguage: "English",
            },
          }),
        }}
      />

      <main
        style={{
          paddingTop: "var(--header-height, 64px)",
          paddingBottom: "var(--footer-height, 64px)",
        }}
        className="h-screen overflow-y-auto bg-gradient-to-br from-neutral-900 via-black to-neutral-950"
      >
        <Header />
        <SupportClient />
        <Footer />
      </main>
    </>
  );
}
