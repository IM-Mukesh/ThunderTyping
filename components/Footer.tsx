// components/Footer.tsx
"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

interface FooterProps {
  className?: string;
}

const LINKS = [
  { href: "/contact", label: "contact" },
  { href: "/support", label: "support" },
  { href: "https://github.com/your-repo", label: "github", external: true },
  { href: "https://discord.gg/your", label: "discord", external: true },
  { href: "https://twitter.com/your", label: "twitter", external: true },
  { href: "/terms", label: "terms" },
  { href: "/security", label: "security" },
  { href: "/privacy", label: "privacy" },
];

export default function Footer({ className = "" }: FooterProps) {
  const reduce = useReducedMotion();

  const container = {
    hidden: { opacity: 0, y: 6 },
    show: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.03, when: "beforeChildren" },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 4 },
    show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  return (
    <motion.footer
      className={`w-full bg-neutral-950 text-neutral-400 ${className}`}
      initial={reduce ? undefined : "hidden"}
      animate={reduce ? undefined : "show"}
      variants={container}
      aria-label="Site footer"
    >
      <div className="max-w-6xl mx-auto px-4 py-2">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 text-[13px] leading-none">
          {/* Left: link row */}
          <motion.ul
            className="flex flex-wrap justify-center md:justify-start items-center gap-4"
            variants={container}
          >
            {LINKS.slice(0, 5).map((l) => (
              <motion.li key={l.label} variants={item}>
                {l.external ? (
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#00CFFF] transition-colors"
                  >
                    {l.label}
                  </a>
                ) : (
                  <Link
                    href={l.href}
                    className="hover:text-[#00CFFF] transition-colors"
                  >
                    {l.label}
                  </Link>
                )}
              </motion.li>
            ))}
          </motion.ul>

          {/* Right: policy links */}
          <motion.ul
            className="flex flex-wrap justify-center md:justify-end items-center gap-4"
            variants={container}
          >
            {LINKS.slice(5).map((l) => (
              <motion.li key={l.label} variants={item}>
                {l.external ? (
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#00CFFF] transition-colors"
                  >
                    {l.label}
                  </a>
                ) : (
                  <Link
                    href={l.href}
                    className="hover:text-[#00CFFF] transition-colors"
                  >
                    {l.label}
                  </Link>
                )}
              </motion.li>
            ))}
          </motion.ul>
        </div>

        {/* Small centered copyright */}
        <motion.div
          className="mt-1 text-center text-[12px] text-neutral-500"
          variants={item}
        >
          © {new Date().getFullYear()} ThunderTyping — made with care.
        </motion.div>
      </div>
    </motion.footer>
  );
}
