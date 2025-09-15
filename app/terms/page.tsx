// app/terms/page.tsx
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — ThunderTyping",
  description:
    "Read ThunderTyping's Terms of Service. Understand your rights and responsibilities when using our online typing test platform.",
  keywords: [
    "ThunderTyping terms",
    "terms of service",
    "user agreement",
    "typing test terms",
    "legal",
  ],
  openGraph: {
    title: "Terms of Service — ThunderTyping",
    description:
      "Read ThunderTyping's Terms of Service. Understand your rights and responsibilities when using our platform.",
    type: "website",
    url: "https://thundertyping.com/terms",
    images: [
      {
        url: "/og/terms.png", // Replace with actual OG image
        width: 1200,
        height: 630,
        alt: "ThunderTyping Terms of Service",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service — ThunderTyping",
    description: "Read ThunderTyping's Terms of Service and user agreement.",
    images: ["/og/terms.png"],
  },
};

export default function TermsPage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": ["WebPage", "LegalService"],
            name: "Terms of Service",
            description:
              "ThunderTyping Terms of Service and user agreement for our online typing test platform.",
            url: "https://thundertyping.com/terms",
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
              Terms of Service
            </h1>

            <p className="text-neutral-300 mb-8">
              <strong>Effective Date:</strong> September 15, 2025
              <br />
              <strong>Last Updated:</strong> September 15, 2025
            </p>

            <div className="prose prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  1. Acceptance of Terms
                </h2>
                <p className="text-neutral-300 leading-relaxed">
                  By accessing and using ThunderTyping ("the Service"), you
                  accept and agree to be bound by the terms and provision of
                  this agreement. If you do not agree to abide by these Terms of
                  Service, you are not authorized to use or access the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  2. Description of Service
                </h2>
                <p className="text-neutral-300 leading-relaxed mb-4">
                  ThunderTyping is an online typing test platform that provides:
                </p>
                <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
                  <li>Real-time typing speed and accuracy measurements</li>
                  <li>Interactive typing tests and practice sessions</li>
                  <li>Performance analytics and progress tracking</li>
                  <li>Customizable typing challenges</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  3. User Responsibilities
                </h2>
                <p className="text-neutral-300 leading-relaxed mb-4">
                  You agree to:
                </p>
                <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
                  <li>Use the Service for lawful purposes only</li>
                  <li>Not attempt to interfere with or disrupt the Service</li>
                  <li>Not use automated tools to manipulate test results</li>
                  <li>
                    Respect the intellectual property rights of ThunderTyping
                  </li>
                  <li>
                    Provide accurate information when creating an account (when
                    available)
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  4. Data Storage and Privacy
                </h2>
                <p className="text-neutral-300 leading-relaxed">
                  Currently, ThunderTyping stores your typing test results and
                  preferences locally in your browser's storage. We do not
                  collect or store personal data on our servers unless you
                  explicitly contact us. For detailed information about data
                  handling, please review our Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  5. Intellectual Property
                </h2>
                <p className="text-neutral-300 leading-relaxed">
                  All content, features, and functionality of ThunderTyping,
                  including but not limited to text, graphics, logos, icons,
                  images, audio clips, and software, are the exclusive property
                  of ThunderTyping and are protected by copyright, trademark,
                  and other intellectual property laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  6. Disclaimer of Warranties
                </h2>
                <p className="text-neutral-300 leading-relaxed">
                  ThunderTyping is provided "as is" without any representations
                  or warranties, express or implied. We make no representations
                  or warranties in relation to this Service or the information
                  and materials provided on this Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  7. Limitation of Liability
                </h2>
                <p className="text-neutral-300 leading-relaxed">
                  ThunderTyping will not be liable to you for any indirect,
                  incidental, special, consequential, or punitive damages,
                  including without limitation, loss of profits, data, use,
                  goodwill, or other intangible losses.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  8. Third-Party Links
                </h2>
                <p className="text-neutral-300 leading-relaxed">
                  Our Service may contain links to third-party websites or
                  services. We are not responsible for the content, privacy
                  policies, or practices of any third-party websites or
                  services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  9. Modifications to Terms
                </h2>
                <p className="text-neutral-300 leading-relaxed">
                  We reserve the right to modify these Terms of Service at any
                  time. Changes will be effective immediately upon posting on
                  this page. Your continued use of the Service after any such
                  changes constitutes your acceptance of the new Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  10. Termination
                </h2>
                <p className="text-neutral-300 leading-relaxed">
                  We may terminate or suspend your access to the Service
                  immediately, without prior notice or liability, for any reason
                  whatsoever, including breach of these Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  11. Contact Information
                </h2>
                <p className="text-neutral-300 leading-relaxed">
                  If you have any questions about these Terms of Service, please
                  contact us through our contact page or support center. We will
                  respond to all inquiries within 48 hours.
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
