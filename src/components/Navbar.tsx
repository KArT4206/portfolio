"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/#work", label: "WORK" },
  { href: "/github", label: "GITHUB" },
  { href: "/#research", label: "RESEARCH" },
  { href: "/about", label: "ABOUT" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="wireframe-divider sticky top-0 z-50 bg-background">
      <nav className="flex items-center justify-between px-6 py-4 md:px-10">
        <Link
          href="/"
          className="font-display text-lg font-medium tracking-[0.05em]"
        >
          KB<span className="text-accent-yellow">/</span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="font-mono text-xs tracking-[0.1em] text-muted transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/#contact"
          className="hidden rounded-full border border-accent-yellow px-[25px] py-[10px] font-mono text-xs uppercase tracking-[0.1em] text-foreground transition-colors hover:bg-accent-yellow hover:text-black md:inline-block"
        >
          Transmit
        </Link>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="rounded-full border border-border-dim p-2 md:hidden"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="wireframe-divider-top overflow-hidden bg-background md:hidden"
          >
            <ul className="flex flex-col gap-1 px-6 py-4">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block px-1 py-3 font-mono text-sm tracking-[0.1em] text-muted transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/#contact"
                  onClick={() => setOpen(false)}
                  className="mt-2 inline-block rounded-full border border-accent-yellow px-[25px] py-[10px] font-mono text-xs uppercase tracking-[0.1em]"
                >
                  Transmit
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
