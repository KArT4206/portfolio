"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

function subscribeFinePointer(callback: () => void) {
  const mql = window.matchMedia("(pointer: fine)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getFinePointerSnapshot(): boolean {
  return window.matchMedia("(pointer: fine)").matches;
}

// Server never has a pointer — this keeps hydration's first client render
// identical to the server-rendered "no cursor" output; useSyncExternalStore
// then syncs to the real value right after mount without a manual effect.
function getServerSnapshot(): boolean {
  return false;
}

/**
 * Desktop-only crosshair cursor with contextual labels. Any element can opt
 * in via `data-cursor="VIEW"` (etc.) — closest() walks up so nested icons/
 * text inside a link still resolve to the link's label. Bails out entirely
 * on coarse pointers (touch) so mobile never mounts this.
 */
export default function HudCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const enabled = useSyncExternalStore(subscribeFinePointer, getFinePointerSnapshot, getServerSnapshot);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("hud-cursor-active");

    function handleMove(e: MouseEvent) {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
      const target = (e.target as HTMLElement)?.closest?.("[data-cursor]");
      setLabel(target?.getAttribute("data-cursor") ?? null);
    }

    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.documentElement.classList.remove("hud-cursor-active");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={dotRef} className="hud-cursor" aria-hidden>
      <svg className="hud-cursor__crosshair" viewBox="0 0 18 18" fill="none">
        <path d="M9 0V5M9 13V18M0 9H5M13 9H18" stroke="#fcff76" strokeWidth="1.5" />
        <circle cx="9" cy="9" r="2.5" stroke="#fcff76" strokeWidth="1.5" />
        <circle cx="9" cy="9" r="1.2" fill="#fcff76" />
      </svg>
      {label && <span className="hud-cursor__label">{label}</span>}
    </div>
  );
}
