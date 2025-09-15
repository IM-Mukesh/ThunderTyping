// app/security/page.tsx
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security — ThunderTyping",
  description:
    "Learn about ThunderTyping's security measures, responsible disclosure policy, and how we protect your data and privacy.",
  keywords: [
    "ThunderTyping security",
    "data security",
    "cybersecurity",
    "responsible disclosure",
    "security policy",
  ],
  openGraph: {
    title: "Security — ThunderTyping",
    description:
      "Learn about ThunderTyping's security measures and responsible disclosure policy.",
    type: "website",
    url: "https://thundertyping.com/security",
    images: [
      {
        url: "/og/security.png", // Replace with actual OG image
        width: 1200,
        height: 630,
        alt: "ThunderTyping Security Policy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Security — ThunderTyping",
    description:
      "Learn about ThunderTyping's security measures and responsible disclosure policy.",
    images: ["/og/security.png"],
  },
};

export default function SecurityPage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": ["WebPage", "CreativeWork"],
            name: "Security Policy",
            description:
              "ThunderTyping Security Policy outlining our security measures, practices, and responsible disclosure procedures.",
            url: "https://thundertyping.com/security",
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
              Security
            </h1>

            <p className="text-neutral-300 mb-8">
              <strong>Last Updated:</strong> September 15, 2025
            </p>

            <div className="prose prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Our Commitment to Security
                </h2>
                <p className="text-neutral-300 leading-relaxed">
                  At ThunderTyping, we take the security of our platform and
                  your data seriously. We implement multiple layers of security
                  measures to protect against unauthorized access, data
                  breaches, and other security threats.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Security Measures
                </h2>

                <h3 className="text-xl font-semibold text-cyan-400 mb-3">
                  Encryption and Data Protection
                </h3>
                <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4 mb-6">
                  <li>
                    <strong>HTTPS Everywhere:</strong> All data transmission is
                    encrypted using TLS 1.3
                  </li>
                  <li>
                    <strong>Secure Headers:</strong> Implementation of security
                    headers including HSTS, CSP, and X-Frame-Options
                  </li>
                  <li>
                    <strong>Local Storage:</strong> User data is stored locally
                    in browsers, reducing server-side data exposure
                  </li>
                  <li>
                    <strong>No Sensitive Data Storage:</strong> We minimize data
                    collection and don't store sensitive personal information
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-cyan-400 mb-3">
                  Infrastructure Security
                </h3>
                <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4 mb-6">
                  <li>
                    <strong>Secure Hosting:</strong> Hosted on reputable cloud
                    platforms with robust security measures
                  </li>
                  <li>
                    <strong>Regular Updates:</strong> All dependencies and
                    systems are kept up-to-date with security patches
                  </li>
                  <li>
                    <strong>Access Control:</strong> Strict access controls and
                    authentication for development and deployment
                  </li>
                  <li>
                    <strong>Monitoring:</strong> Continuous monitoring for
                    suspicious activities and security threats
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-cyan-400 mb-3">
                  Application Security
                </h3>
                <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
                  <li>
                    <strong>Input Validation:</strong> All user inputs are
                    validated and sanitized
                  </li>
                  <li>
                    <strong>XSS Protection:</strong> Implementation of
                    Cross-Site Scripting prevention measures
                  </li>
                  <li>
                    <strong>CSRF Protection:</strong> Protection against
                    Cross-Site Request Forgery attacks
                  </li>
                  <li>
                    <strong>Rate Limiting:</strong> API rate limiting to prevent
                    abuse and DDoS attacks
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Data Security Practices
                </h2>
                <p className="text-neutral-300 leading-relaxed mb-4">
                  We follow industry best practices for data security:
                </p>
                <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
                  <li>
                    <strong>Data Minimization:</strong> We collect only
                    necessary information for service functionality
                  </li>
                  <li>
                    <strong>Secure Development:</strong> Security-first
                    development practices and code reviews
                  </li>
                  <li>
                    <strong>Third-party Security:</strong> Careful vetting of
                    third-party services and dependencies
                  </li>
                  <li>
                    <strong>Backup Security:</strong> Secure backup procedures
                    with encryption at rest
                  </li>
                  <li>
                    <strong>Incident Response:</strong> Prepared incident
                    response procedures for security events
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Responsible Disclosure Policy
                </h2>
                <p className="text-neutral-300 leading-relaxed mb-4">
                  We welcome and encourage responsible disclosure of security
                  vulnerabilities. If you discover a security issue, please
                  follow these guidelines:
                </p>

                <h3 className="text-xl font-semibold text-cyan-400 mb-3">
                  How to Report
                </h3>
                <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4 mb-6">
                  <li>
                    Contact us immediately through our contact form with
                    "Security Vulnerability" in the subject
                  </li>
                  <li>
                    Provide detailed information about the vulnerability and
                    steps to reproduce
                  </li>
                  <li>
                    Include your contact information for follow-up communication
                  </li>
                  <li>
                    Allow us reasonable time to investigate and address the
                    issue
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-cyan-400 mb-3">
                  What We Ask
                </h3>
                <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4 mb-6">
                  <li>
                    Do not access, modify, or delete data that doesn't belong to
                    you
                  </li>
                  <li>
                    Do not perform actions that could harm our users or services
                  </li>
                  <li>
                    Do not publicly disclose the vulnerability until we've had
                    time to address it
                  </li>
                  <li>
                    Act in good faith and avoid privacy violations or service
                    disruption
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-cyan-400 mb-3">
                  Our Commitment
                </h3>
                <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
                  <li>We will respond to your report within 48 hours</li>
                  <li>
                    We will keep you informed about our progress on the issue
                  </li>
                  <li>
                    We will not take legal action against researchers who follow
                    this policy
                  </li>
                  <li>
                    We will publicly acknowledge responsible researchers (with
                    permission)
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Security Updates and Notifications
                </h2>
                <p className="text-neutral-300 leading-relaxed mb-4">
                  In the event of a security incident that may affect user data
                  or service availability:
                </p>
                <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
                  <li>We will investigate and contain the incident promptly</li>
                  <li>
                    Affected users will be notified within 72 hours when
                    possible
                  </li>
                  <li>
                    We will provide clear information about the incident and
                    remediation steps
                  </li>
                  <li>
                    Security updates will be published on this page when
                    appropriate
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  User Security Best Practices
                </h2>
                <p className="text-neutral-300 leading-relaxed mb-4">
                  Help us keep ThunderTyping secure by following these
                  recommendations:
                </p>
                <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
                  <li>Keep your browser updated to the latest version</li>
                  <li>
                    Use strong, unique passwords if user accounts become
                    available
                  </li>
                  <li>Be cautious of phishing attempts or suspicious links</li>
                  <li>Report any suspicious activity or security concerns</li>
                  <li>Clear your browser data if using shared computers</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Security Compliance
                </h2>
                <p className="text-neutral-300 leading-relaxed mb-4">
                  ThunderTyping adheres to industry security standards and best
                  practices, including:
                </p>
                <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
                  <li>OWASP security guidelines for web applications</li>
                  <li>Modern web security standards and protocols</li>
                  <li>
                    Regular security assessments and vulnerability scanning
                  </li>
                  <li>Privacy-by-design principles in development</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Contact for Security Matters
                </h2>
                <p className="text-neutral-300 leading-relaxed">
                  For security-related inquiries, vulnerability reports, or
                  other security matters, please contact us through our contact
                  form with "Security" in the subject line. We treat all
                  security communications with the highest priority and will
                  respond within 48 hours.
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
