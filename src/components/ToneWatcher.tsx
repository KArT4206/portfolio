"use client";

import { useEffect } from "react";
import { isDarkAt } from "@/lib/surfaceTone";

// Sets data-top-tone / data-bottom-tone on <html> to "dark" or "light" for
// what's under the navbar and the bottom edge, so fixed UI can flip colour
// with plain CSS instead of mix-blend-mode (which forces the browser to
// re-blend the whole page every frame).
export default function ToneWatcher() {
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    const update = () => {
      raf = 0;
      const x = window.innerWidth / 2;
      root.dataset.topTone = isDarkAt(x, 36) ? "dark" : "light";
      root.dataset.bottomTone = isDarkAt(x, window.innerHeight - 24) ? "dark" : "light";
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);
  return null;
}
