// components/Header.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ThunderLogo } from "@/components/ThunderLogo";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface HeaderProps {
  className?: string;
}

/**
 * NAV_ITEMS:
 * keep these as the place you'll add links for future releases.
 * I've left commented examples here so you can enable them later.
 */
const NAV_ITEMS = [
  // { href: "/games", label: "Games" },
  // { href: "/about", label: "About" },
  // { href: "/blog", label: "Blog" },
  // { href: "/setting", label: "Settings" },
  { href: "/settings", label: "Setting" }, // placeholder — you can update label when ready
];

export default function Header({ className = "" }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const reduceMotion = useReducedMotion();

  // Close on Escape
  useEffect(() => {
    const closeOnEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", closeOnEsc);
    return () => document.removeEventListener("keydown", closeOnEsc);
  }, []);

  // Scroll lock using a class (safer than mutating inline styles)
  useEffect(() => {
    const cls = "body-scroll-locked";
    if (open) {
      document.documentElement.classList.add(cls);
      document.body.classList.add(cls);
    } else {
      document.documentElement.classList.remove(cls);
      document.body.classList.remove(cls);
    }
    return () => {
      document.documentElement.classList.remove(cls);
      document.body.classList.remove(cls);
    };
  }, [open]);

  // Keep first focus on close button when opened (accessibility)
  useEffect(() => {
    if (open && closeBtnRef.current) {
      // small timeout so the panel finishes animating before focus (helps SR/VO)
      setTimeout(() => closeBtnRef.current?.focus(), 30);
    }
  }, [open]);

  // Lightweight focus trap while the mobile menu is open.
  useEffect(() => {
    if (!open) return;

    const panel = document.querySelector(
      "[data-mobile-panel]"
    ) as HTMLElement | null;
    if (!panel) return;

    const focusable = Array.from(
      panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
    );
    const first = focusable[0] ?? closeBtnRef.current;
    const last = focusable[focusable.length - 1] ?? closeBtnRef.current;

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (!first || !last) return;

      // shift + tab on first -> move to last
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
      // tab on last -> move to first
      else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={`fixed top-0 left-0 right-0 w-full z-[60] ${className}`}>
      {/* Full-width background with gradient and backdrop blur */}
      <div className="absolute inset-0 bg-gradient-to-br  backdrop-blur-md "></div>

      {/* Content container */}
      <div className="relative max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo + Brand */}
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="ThunderTyping home"
          >
            <ThunderLogo size={42} className="block text-[#00CFFF]" />
            <span className="font-bold text-2xl text-[#00CFFF]">
              ThunderTyping
            </span>
          </Link>

          {/* Desktop nav (hidden on mobile) */}
          <nav
            className="hidden md:flex items-center gap-8"
            aria-label="Primary navigation"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white hover:text-[#00CFFF] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center">
            <button
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="relative w-10 h-10 rounded-lg flex items-center justify-center ring-0 focus:outline-none focus:ring-2 focus:ring-[#00CFFF] transition"
            >
              <span className="sr-only">
                {open ? "Close menu" : "Open menu"}
              </span>

              {/* Hamburger animated lines — keep as you had */}
              <motion.span
                className="block w-6 h-0.5 bg-white rounded-sm origin-center"
                animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -5 }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.18 }}
              />
              <motion.span
                className="block w-6 h-0.5 bg-white rounded-sm origin-center absolute"
                animate={open ? { opacity: 0 } : { opacity: 1 }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.18 }}
              />
              <motion.span
                className="block w-6 h-0.5 bg-white rounded-sm origin-center absolute"
                animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 5 }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.18 }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sliding menu overlay */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.18 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Sliding panel */}
            <motion.div
              data-mobile-panel
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 300, damping: 30 }
              }
              className="fixed top-0 left-0 right-0 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black min-h-screen z-50 p-6"
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-menu-title"
            >
              <h2 id="mobile-menu-title" className="sr-only">
                Main menu
              </h2>

              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  className="flex items-center gap-3"
                  onClick={() => setOpen(false)}
                >
                  <ThunderLogo size={36} className="block text-[#00CFFF]" />
                  <span className="font-bold text-xl text-[#00CFFF]">
                    ThunderTyping
                  </span>
                </Link>

                <button
                  ref={closeBtnRef}
                  aria-label="Close menu"
                  className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00CFFF]"
                  onClick={() => setOpen(false)}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M6 6L18 18"
                      stroke="#CFF9FF"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M6 18L18 6"
                      stroke="#CFF9FF"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {/* menu items */}
              <nav className="mt-10">
                <ul className="flex flex-col gap-6">
                  {NAV_ITEMS.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="block text-2xl font-semibold text-white hover:text-[#00CFFF]"
                      >
                        {item.label || item.href.replace("/", "")}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* optional small footer actions */}
              <div className="mt-12 text-sm text-neutral-400">
                <p>Enjoy the best typing experience — built with ❤️</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
