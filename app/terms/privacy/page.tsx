// app/privacy/page.tsx
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — ThunderTyping",
  description:
    "Learn how ThunderTyping protects your privacy. Read our privacy policy to understand how we collect, use, and protect your personal information.",
  keywords: [
    "ThunderTyping privacy",
    "privacy policy",
    "data protection",
    "user privacy",
    "GDPR compliance",
  ],
  openGraph: {
    title: "Privacy Policy — ThunderTyping",
    description:
      "Learn how ThunderTyping protects your privacy and handles your personal information.",
    type: "website",
    url: "https://thundertyping.com/privacy",
    images: [
      {
        url: "/og/privacy.png", // Replace with actual OG image
        width: 1200,
        height: 630,
        alt: "ThunderTyping Privacy Policy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy — ThunderTyping",
    description:
      "Learn how ThunderTyping protects your privacy and personal information.",
    images: ["/og/privacy.png"],
  },
};

export default function PrivacyPage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": ["WebPage", "CreativeWork"],
            name: "Privacy Policy",
            description:
              "ThunderTyping Privacy Policy explaining how we collect, use, and protect user information.",
            url: "https://thundertyping.com/privacy",
            provider: {
              "@type": "Organization",
              name: "ThunderTyping",
              url: "https://thundertyping.com",
            },
            datePublished: "2025-01-15",
            dateModified: "2025-01-15",
          }),
        }}
      />
      <Header />
      <main
        style={{
          paddingTop: "var(--header-height, 64px)",
          paddingBottom: "var(--footer-height, 64px)",
        }}
        className="h-screen overflow-y-auto bg-gradient-to-br from-neutral-900 via-black to-neutral-950"
      >
        <div className="container mx-auto px-6 py-12 max-w-4xl">
          <div className="bg-neutral-800/30 backdrop-blur-sm border border-neutral-700/50 rounded-2xl p-8 lg:p-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              Privacy Policy
            </h1>

            <p className="text-neutral-300 mb-8">
              <strong>Effective Date:</strong> September 15, 2025
              <br />
              <strong>Last Updated:</strong> September 15, 2025
            </p>

            <div className="prose prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  1. Information We Collect
                </h2>
                <h3 className="text-xl font-semibold text-cyan-400 mb-3">
                  Information You Provide
                </h3>
                <p className="text-neutral-300 leading-relaxed mb-4">
                  We may collect information you voluntarily provide when you:
                </p>
                <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
                  <li>Contact us through our contact form or support system</li>
                  <li>
                    Subscribe to notifications or updates (when available)
                  </li>
                  <li>Participate in surveys or feedback requests</li>
                </ul>

                <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-6">
                  Automatically Collected Information
                </h3>
                <p className="text-neutral-300 leading-relaxed mb-4">
                  When you use ThunderTyping, we may automatically collect:
                </p>
                <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
                  <li>
                    Typing test results and performance metrics (stored locally)
                  </li>
                  <li>
                    Browser type, device information, and operating system
                  </li>
                  <li>Usage patterns and feature interactions</li>
                  <li>Analytics data through Google Analytics (anonymized)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  2. How We Use Your Information
                </h2>
                <p className="text-neutral-300 leading-relaxed mb-4">
                  We use collected information to:
                </p>
                <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
                  <li>Provide and maintain the ThunderTyping service</li>
                  <li>Improve user experience and platform performance</li>
                  <li>Respond to your questions and support requests</li>
                  <li>Analyze usage patterns to enhance features</li>
                  <li>Ensure platform security and prevent abuse</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  3. Data Storage and Security
                </h2>
                <h3 className="text-xl font-semibold text-cyan-400 mb-3">
                  Local Storage
                </h3>
                <p className="text-neutral-300 leading-relaxed mb-4">
                  Your typing test results and preferences are primarily stored
                  locally in your browser's storage. This data remains on your
                  device and is not transmitted to our servers unless you
                  explicitly contact us.
                </p>

                <h3 className="text-xl font-semibold text-cyan-400 mb-3">
                  Security Measures
                </h3>
                <p className="text-neutral-300 leading-relaxed mb-4">
                  We implement security measures including:
                </p>
                <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
                  <li>HTTPS encryption for all data transmission</li>
                  <li>Regular security updates and monitoring</li>
                  <li>Limited data collection and processing</li>
                  <li>Secure hosting infrastructure</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  4. Cookies and Tracking
                </h2>
                <p className="text-neutral-300 leading-relaxed mb-4">
                  ThunderTyping uses:
                </p>
                <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
                  <li>
                    <strong>Essential Cookies:</strong> Required for basic
                    platform functionality
                  </li>
                  <li>
                    <strong>Analytics Cookies:</strong> Google Analytics to
                    understand usage patterns (anonymized)
                  </li>
                  <li>
                    <strong>Preference Cookies:</strong> To remember your
                    settings and preferences
                  </li>
                </ul>
                <p className="text-neutral-300 leading-relaxed mt-4">
                  You can control cookie preferences through your browser
                  settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  5. Third-Party Services
                </h2>
                <p className="text-neutral-300 leading-relaxed mb-4">
                  We use the following third-party services:
                </p>
                <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
                  <li>
                    <strong>Google Analytics:</strong> For anonymized usage
                    analytics
                  </li>
                  <li>
                    <strong>Vercel Analytics:</strong> For performance
                    monitoring
                  </li>
                  <li>
                    <strong>CDN Services:</strong> For fast content delivery
                  </li>
                </ul>
                <p className="text-neutral-300 leading-relaxed mt-4">
                  These services have their own privacy policies that govern
                  their data handling practices.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  6. Your Rights and Choices
                </h2>
                <p className="text-neutral-300 leading-relaxed mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
                  <li>Access information we have about you</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Request deletion of your personal data</li>
                  <li>Opt out of non-essential data collection</li>
                  <li>Export your locally stored data</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  7. Children's Privacy
                </h2>
                <p className="text-neutral-300 leading-relaxed">
                  ThunderTyping is designed for general audiences and does not
                  knowingly collect personal information from children under 13.
                  If you are a parent or guardian and believe your child has
                  provided us with personal information, please contact us
                  immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  8. Data Retention
                </h2>
                <p className="text-neutral-300 leading-relaxed">
                  Locally stored data (typing results, preferences) remains on
                  your device until you clear your browser storage. Any
                  information you provide through contact forms is retained only
                  as long as necessary to respond to your inquiry.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  9. International Data Transfers
                </h2>
                <p className="text-neutral-300 leading-relaxed">
                  Our services are hosted globally. By using ThunderTyping, you
                  consent to the transfer of your information to countries that
                  may have different data protection laws than your country of
                  residence.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  10. Changes to This Policy
                </h2>
                <p className="text-neutral-300 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will
                  notify you of any changes by posting the new Privacy Policy on
                  this page and updating the "Last Updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  11. Contact Us
                </h2>
                <p className="text-neutral-300 leading-relaxed">
                  If you have any questions about this Privacy Policy or our
                  data practices, please contact us through our contact page. We
                  respond to all privacy-related inquiries within 48 hours.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
