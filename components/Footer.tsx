"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Github,
  Mail,
  Heart,
  Shield,
  FileText,
  HelpCircle,
  Lock,
} from "lucide-react";

interface FooterProps {
  className?: string;
}

/**
 * NOTE:
 * The footer sets a CSS custom property --footer-height which the KeyboardHint
 * uses to position itself above the footer so it won't overlap.
 *
 * FIX:
 * - Footer is now fixed to viewport bottom so it stays visible on mobile.
 * - Background matches the page/TypingTest gradient.
 * - Footer height reduced (48px).
 * - Full width background to prevent content showing through
 * - Fixed external links to open in new tab only for external URLs
 */
const LINKS = [
  { href: "/contact", label: "contact", icon: Mail, external: false },
  { href: "/support", label: "support", icon: HelpCircle, external: false },
  {
    href: "https://github.com/IM-Mukesh/ThunderTyping",
    label: "github",
    icon: Github,
    external: true,
  },
  { href: "/terms", label: "terms", icon: FileText, external: false },
  { href: "/security", label: "security", icon: Shield, external: false },
  { href: "/privacy", label: "privacy", icon: Lock, external: false },
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
    show: { opacity: 1, y: 0, transition: { duration: 0.18 } },
  };

  const footerHeight = "48px";

  return (
    <motion.footer
      aria-label="Site footer"
      style={{ ["--footer-height" as any]: footerHeight }}
      initial={reduce ? undefined : "hidden"}
      animate={reduce ? undefined : "show"}
      variants={container}
      className={`fixed left-0 right-0 bottom-[env(safe-area-inset-bottom,0px)] 
                  w-full z-30 text-neutral-400 ${className}`}
    >
      {/* Full-width background with gradient and border */}
      <div className="absolute inset-0 bg-gradient-to-br  backdrop-blur-md "></div>

      {/* Content container */}
      <div className="relative max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 text-[11px] sm:text-[12px] leading-none">
          {/* Left block: links */}
          <motion.ul
            className="flex flex-wrap items-center gap-3 sm:gap-4"
            variants={container}
          >
            {LINKS.slice(0, 3).map((l) => {
              const Icon = l.icon;
              return (
                <motion.li key={l.label} variants={item}>
                  {l.external ? (
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-[#00CFFF] transition-colors group cursor-pointer"
                      aria-label={l.label}
                    >
                      <Icon
                        size={13}
                        className="group-hover:scale-110 transition-transform duration-200"
                      />
                      <span>{l.label}</span>
                    </a>
                  ) : (
                    <Link
                      href={l.href}
                      className="flex items-center gap-2 hover:text-[#00CFFF] transition-colors group cursor-pointer"
                      aria-label={l.label}
                    >
                      <Icon
                        size={13}
                        className="group-hover:scale-110 transition-transform duration-200"
                      />
                      <span>{l.label}</span>
                    </Link>
                  )}
                </motion.li>
              );
            })}
          </motion.ul>

          {/* Right block: policy links */}
          <motion.ul
            className="flex flex-wrap items-center gap-3 sm:gap-4"
            variants={container}
          >
            {LINKS.slice(3).map((l) => {
              const Icon = l.icon;
              return (
                <motion.li key={l.label} variants={item}>
                  {l.external ? (
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-[#00CFFF] transition-colors group cursor-pointer"
                      aria-label={l.label}
                    >
                      <Icon
                        size={13}
                        className="group-hover:scale-110 transition-transform duration-200"
                      />
                      <span>{l.label}</span>
                    </a>
                  ) : (
                    <Link
                      href={l.href}
                      className="flex items-center gap-2 hover:text-[#00CFFF] transition-colors group cursor-pointer"
                      aria-label={l.label}
                    >
                      <Icon
                        size={13}
                        className="group-hover:scale-110 transition-transform duration-200"
                      />
                      <span>{l.label}</span>
                    </Link>
                  )}
                </motion.li>
              );
            })}
          </motion.ul>
        </div>

        {/* Small copyright with heart */}
        <motion.div
          className="mt-1 text-center text-[10px] sm:text-[11px] text-neutral-500 flex items-center justify-center gap-1"
          variants={item}
        >
          <span>© {new Date().getFullYear()} ThunderTyping — made with</span>
          <Heart size={11} className="text-red-400" fill="currentColor" />
          <span>care.</span>
        </motion.div>
      </div>
    </motion.footer>
  );
}
