// components/Header.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ThunderLogo } from "@/components/ThunderLogo";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  className?: string;
}

const NAV_ITEMS = [
  //   { href: "/games", label: "Games" },
  //   { href: "/about", label: "About" },
  //   { href: "/blog", label: "Blog" },
  //   { href: "/setting", label: "Settings" },
  { href: "/setting", label: "" },
];

export default function Header({ className = "" }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const closeOnEsc = (e: KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  };

  // lock scroll while menu open
  useEffect(() => {
    document.addEventListener("keydown", closeOnEsc);
    if (open) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", closeOnEsc);
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [open]);

  // keep first focus on close button when opened (accessibility)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (open && closeBtnRef.current) closeBtnRef.current.focus();
  }, [open]);

  return (
    <header
      className={`fixed top-6 left-1/2 transform -translate-x-1/2 w-full max-w-6xl z-[60] ${className}`}
    >
      <div className="flex items-center justify-between px-6 py-3 bg-transparent">
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
        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
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
            {/* hamburger / close icon animated */}
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <motion.span
              className="block w-6 h-0.5 bg-white rounded-sm origin-center"
              animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -5 }}
              transition={{ duration: 0.18 }}
            />
            <motion.span
              className="block w-6 h-0.5 bg-white rounded-sm origin-center absolute"
              animate={open ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.18 }}
            />
            <motion.span
              className="block w-6 h-0.5 bg-white rounded-sm origin-center absolute"
              animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 5 }}
              transition={{ duration: 0.18 }}
            />
          </button>
        </div>
      </div>

      {/* Mobile sliding menu overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="md:hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Sliding panel */}
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 right-0 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black min-h-screen z-50 p-6"
              role="dialog"
              aria-modal="true"
            >
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
                  {/* simple X icon */}
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
                <motion.ul
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={{
                    hidden: {},
                    visible: {},
                  }}
                  className="flex flex-col gap-6"
                >
                  {NAV_ITEMS.map((item, i) => (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 + 0.05 }}
                      className=""
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="block text-2xl font-semibold text-white hover:text-[#00CFFF] transition-colors"
                      >
                        {item.label}
                      </Link>
                    </motion.li>
                  ))}
                </motion.ul>
              </nav>

              {/* optional small footer actions */}
              <div className="mt-12 text-sm text-neutral-400">
                <p>Enjoy the best typing experience — built with ❤️</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
