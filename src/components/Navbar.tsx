"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/#about", label: "About me" },
  { href: "/#work", label: "Work" },
  { href: "/#services", label: "Services" },
  { href: "/#freelance", label: "Freelance" },
  { href: "/#research", label: "Research" },
  { href: "/github", label: "GitHub" },
];

// mix-blend-difference keeps the white navbar readable over both the black
// hero and the white sections without tracking scroll position.
export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header>
      <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-5 text-white mix-blend-difference md:px-10">
        <Link href="/" className="font-display text-xl font-extrabold tracking-tight">
          karthik.b
        </Link>

        <ul className="hidden items-center gap-7 text-sm md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="opacity-70 transition-opacity hover:opacity-100">
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/#contact"
              className="inline-flex items-center gap-1.5 rounded-full border border-white px-5 py-2 transition-colors hover:bg-white hover:text-black"
            >
              Hire me <ArrowUpRight size={14} />
            </Link>
          </li>
        </ul>

        <button
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="rounded-full border border-white p-2 md:hidden"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-20 z-50 rounded-2xl bg-black/95 p-4 text-white md:hidden"
          >
            <ul className="flex flex-col">
              {[...NAV_LINKS, { href: "/#contact", label: "Hire me" }].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block py-3 text-lg font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
