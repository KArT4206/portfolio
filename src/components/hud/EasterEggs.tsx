"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

// g-then-key navigation shortcuts, GitHub-style.
const NAV_SHORTCUTS: Record<string, string> = {
  h: "/",
  w: "/#work",
  r: "/#research",
  a: "/about",
  g: "/github",
  c: "/#contact",
};

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

/**
 * Two hidden interactions, guarded so they never fire while someone's
 * typing: a Konami-code toggle for a decorative "secret mode", and
 * GitHub-style `g` then `<key>` navigation shortcuts.
 */
export default function EasterEggs({ maxWarpEnabled = true }: { maxWarpEnabled?: boolean }) {
  const router = useRouter();
  const [secretMode, setSecretMode] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let buffer: string[] = [];
    let awaitingNavKey = false;
    let navTimeout: ReturnType<typeof setTimeout> | null = null;

    function showToast(msg: string) {
      setToast(msg);
      setTimeout(() => setToast(null), 2200);
    }

    function handleKeydown(e: KeyboardEvent) {
      if (isTyping(e.target)) return;

      buffer = [...buffer, e.key].slice(-KONAMI.length);
      if (buffer.join(",") === KONAMI.join(",")) {
        if (!maxWarpEnabled) {
          buffer = [];
          return;
        }
        setSecretMode((v) => {
          const next = !v;
          showToast(next ? "MAXIMUM WARP: ENGAGED" : "MAXIMUM WARP: DISENGAGED");
          window.dispatchEvent(new CustomEvent("kb:maxwarp", { detail: { active: next } }));
          return next;
        });
        buffer = [];
        return;
      }

      if (awaitingNavKey) {
        awaitingNavKey = false;
        if (navTimeout) clearTimeout(navTimeout);
        const dest = NAV_SHORTCUTS[e.key.toLowerCase()];
        if (dest) {
          router.push(dest);
          showToast(`NAV → ${dest}`);
        }
        return;
      }

      if (e.key.toLowerCase() === "g") {
        awaitingNavKey = true;
        navTimeout = setTimeout(() => {
          awaitingNavKey = false;
        }, 1200);
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
      if (navTimeout) clearTimeout(navTimeout);
    };
  }, [router, maxWarpEnabled]);

  useEffect(() => {
    document.documentElement.classList.toggle("hud-secret-mode", secretMode);
  }, [secretMode]);

  if (!toast) return null;

  return (
    <div
      role="status"
      className="pointer-events-none fixed bottom-[15px] left-1/2 z-[280] -translate-x-1/2 border border-accent-green bg-black px-[15px] py-[8px] font-mono text-[11px] uppercase tracking-[0.1em] text-accent-green"
    >
      {toast}
    </div>
  );
}
