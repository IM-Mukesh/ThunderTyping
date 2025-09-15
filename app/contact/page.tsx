// app/contact/page.tsx
import type { Metadata } from "next";
import ContactClient from "./ContactClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contact — ThunderTyping",
  description:
    "Get in touch with ThunderTyping. Send us your questions, feedback, or suggestions about our online typing test platform.",
  keywords: [
    "contact ThunderTyping",
    "typing test support",
    "feedback",
    "customer service",
    "help",
  ],
  openGraph: {
    title: "Contact — ThunderTyping",
    description:
      "Get in touch with ThunderTyping. Send us your questions, feedback, or suggestions about our online typing test platform.",
    type: "website",
    url: "https://thundertyping.com/contact",
    images: [
      {
        url: "/og/contact.png", // Replace with actual OG image
        width: 1200,
        height: 630,
        alt: "Contact ThunderTyping",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact — ThunderTyping",
    description:
      "Get in touch with ThunderTyping. Send us your questions, feedback, or suggestions.",
    images: ["/og/contact.png"],
  },
};

export default function ContactPage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: "Contact ThunderTyping",
            description:
              "Get in touch with ThunderTyping for questions, feedback, or support with our online typing test platform.",
            url: "https://thundertyping.com/contact",
            mainEntity: {
              "@type": "ContactPoint",
              contactType: "Customer Service",
              availableLanguage: "English",
              areaServed: "Worldwide",
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
        <ContactClient />
        <Footer />
      </main>
    </>
  );
}
