"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { HudIndex, HudIndicator } from "@/components/hud/primitives";

const NAV_LINKS = [
  { index: 1, href: "/#work", label: "WORK", path: "/" },
  { index: 2, href: "/#research", label: "RESEARCH", path: "/" },
  { index: 3, href: "/#awards", label: "AWARDS", path: "/" },
  { index: 4, href: "/github", label: "GITHUB", path: "/github" },
  { index: 5, href: "/about", label: "ABOUT", path: "/about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="wireframe-divider sticky top-0 z-50 bg-background">
      <nav className="flex items-center justify-between px-6 py-4 md:px-10">
        <Link
          href="/"
          data-cursor="NAV"
          className="font-display text-lg font-medium tracking-[0.05em]"
        >
          00<span className="text-accent-yellow">/</span> KB
        </Link>

        <ul className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.path;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  data-cursor="NAV"
                  className={`group inline-flex items-baseline gap-[6px] font-mono text-xs tracking-[0.1em] transition-colors ${
                    active ? "text-foreground" : "text-muted hover:text-foreground"
                  }`}
                >
                  <HudIndicator tone={active ? "on" : "off"} />
                  <span className="text-[10px] text-dim group-hover:text-accent-yellow">
                    <HudIndex n={link.index} />
                  </span>
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <Link
          href="/#contact"
          data-cursor="CONNECT"
          className="hidden rounded-full border border-accent-yellow px-[25px] py-[10px] font-mono text-xs uppercase tracking-[0.1em] text-foreground transition-colors hover:bg-accent-yellow hover:text-black md:inline-block"
        >
          06 / Transmit
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
            transition={{ duration: 0.15, ease: "linear" }}
            className="wireframe-divider-top overflow-hidden bg-background md:hidden"
          >
            <ul className="flex flex-col gap-1 px-6 py-4">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-2 px-1 py-3 font-mono text-sm tracking-[0.1em] text-muted transition-colors hover:text-foreground"
                  >
                    <span className="text-[10px] text-accent-yellow">
                      <HudIndex n={link.index} />
                    </span>
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/#contact"
                  onClick={() => setOpen(false)}
                  data-cursor="CONNECT"
                  className="mt-2 inline-block rounded-full border border-accent-yellow px-[25px] py-[10px] font-mono text-xs uppercase tracking-[0.1em]"
                >
                  06 / Transmit
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
