// components/Footer.tsx
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
} from "lucide-react";

interface FooterProps {
  className?: string;
}

const LINKS = [
  {
    href: "/contact",
    label: "contact",
    icon: Mail,
    external: false,
  },
  {
    href: "/support",
    label: "support",
    icon: HelpCircle,
    external: false,
  },
  {
    href: "https://github.com/IM-Mukesh/ThunderTyping",
    label: "github",
    icon: Github,
    external: true,
  },
  {
    href: "/terms",
    label: "terms",
    icon: FileText,
    external: false,
  },
  {
    href: "/security",
    label: "security",
    icon: Shield,
    external: false,
  },
  {
    href: "/privacy",
    label: "privacy",
    icon: FileText,
    external: false,
  },
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
      className={`w-full from-neutral-900 via-neutral-950 to-black text-neutral-400 ${className} flex justify-center items-center py-2`}
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
            {LINKS.slice(0, 3).map((l) => {
              const IconComponent = l.icon;
              return (
                <motion.li key={l.label} variants={item}>
                  {l.external ? (
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-[#00CFFF] transition-colors group"
                    >
                      <IconComponent
                        size={14}
                        className="group-hover:scale-110 transition-transform duration-200"
                      />
                      <span>{l.label}</span>
                    </a>
                  ) : (
                    <Link
                      href={l.href}
                      className="flex items-center gap-1.5 hover:text-[#00CFFF] transition-colors group"
                    >
                      <IconComponent
                        size={14}
                        className="group-hover:scale-110 transition-transform duration-200"
                      />
                      <span>{l.label}</span>
                    </Link>
                  )}
                </motion.li>
              );
            })}
          </motion.ul>

          {/* Right: policy links */}
          <motion.ul
            className="flex flex-wrap justify-center md:justify-end items-center gap-4"
            variants={container}
          >
            {LINKS.slice(3).map((l) => {
              const IconComponent = l.icon;
              return (
                <motion.li key={l.label} variants={item}>
                  {l.external ? (
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-[#00CFFF] transition-colors group"
                    >
                      <IconComponent
                        size={14}
                        className="group-hover:scale-110 transition-transform duration-200"
                      />
                      <span>{l.label}</span>
                    </a>
                  ) : (
                    <Link
                      href={l.href}
                      className="flex items-center gap-1.5 hover:text-[#00CFFF] transition-colors group"
                    >
                      <IconComponent
                        size={14}
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

        {/* Small centered copyright with heart icon */}
        <motion.div
          className="mt-2 text-center text-[12px] text-neutral-500 flex items-center justify-center gap-1"
          variants={item}
        >
          <span>© {new Date().getFullYear()} ThunderTyping — made with</span>
          <Heart
            size={12}
            className="text-red-400 animate-pulse"
            fill="currentColor"
          />
          <span>care.</span>
        </motion.div>
      </div>
    </motion.footer>
  );
}
