"use client";

import { useEffect, useRef, useState } from "react";
import { stoneTextureUrl } from "./stoneTexture";

type Phase = "on" | "failing" | "off" | "restoring";

const AUTO_RESTORE_MS = 45000;

export default function Blackout() {
  const [phase, setPhase] = useState<Phase>("on");
  const [scarab, setScarab] = useState<{ x: number; y: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const phaseRef = useRef<Phase>("on");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));
    const set = (p: Phase) => {
      phaseRef.current = p;
      setPhase(p);
    };

    const moveTorch = (x: number, y: number) => {
      root.style.setProperty("--torch-x", `${x}px`);
      root.style.setProperty("--torch-y", `${y}px`);
    };

    const restore = () => {
      if (phaseRef.current !== "off") return;
      set("restoring");
      later(() => {
        root.removeAttribute("data-theme");
        set("on");
        setScarab(null);
        window.dispatchEvent(new CustomEvent("kb:power", { detail: { on: true } }));
      }, reduce ? 200 : 900);
    };

    const cut = () => {
      if (phaseRef.current !== "on") return;
      if (!root.style.getPropertyValue("--stone")) root.style.setProperty("--stone", stoneTextureUrl());
      moveTorch(window.innerWidth / 2, window.innerHeight / 2);
      set("failing");
      later(() => {
        root.setAttribute("data-theme", "tomb");
        set("off");
        setScarab({ x: 10 + Math.random() * 75, y: 18 + Math.random() * 60 });
        window.dispatchEvent(new CustomEvent("kb:power", { detail: { on: false } }));
        later(restore, AUTO_RESTORE_MS);
      }, reduce ? 150 : 1300);
    };

    const onPointer = (e: PointerEvent) => {
      if (phaseRef.current === "off") moveTorch(e.clientX, e.clientY);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") restore();
    };
    const onRestore = () => restore();

    window.addEventListener("kb:blackout", cut);
    window.addEventListener("kb:restore-power", onRestore);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    window.addEventListener("keydown", onKey);
    const pending = timers.current;
    return () => {
      window.removeEventListener("kb:blackout", cut);
      window.removeEventListener("kb:restore-power", onRestore);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
      pending.forEach(clearTimeout);
      root.removeAttribute("data-theme");
    };
  }, []);

  if (phase === "on") return null;

  return (
    <>
      {scarab && (phase === "off" || phase === "restoring") && (
        <button
          type="button"
          aria-label="A carved scarab"
          onClick={() => {
            setToast("𓆣 you found the sacred scarab — +100 aura");
            setTimeout(() => setToast(null), 2600);
          }}
          className="tomb-glyph fixed z-[80] text-5xl"
          style={{ left: `${scarab.x}%`, top: `${scarab.y}%` }}
        >
          𓆣
        </button>
      )}

      <div
        aria-hidden
        className={`pointer-events-none fixed inset-0 z-[90] ${
          phase === "failing" ? "blackout-failing" : phase === "restoring" ? "blackout-restoring" : "blackout-dark"
        }`}
      />
      {phase === "off" && <div aria-hidden className="torch-glow pointer-events-none fixed inset-0 z-[91]" />}

      {(phase === "off" || phase === "restoring") && (
        <>
          <p className="sr-only" role="status">
            Power cut. Move your cursor to light the torch. Press Escape or the fuse button to restore power.
          </p>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("kb:restore-power"))}
            className="fuse-box fixed bottom-4 right-4 z-[97] flex items-center gap-2 rounded-md border-2 border-amber-300/70 bg-black px-3 py-2 font-mono text-xs uppercase tracking-widest text-amber-200"
          >
            ⚡ fix the fuse
          </button>
        </>
      )}

      {toast && (
        <div role="status" className="fixed left-1/2 top-24 z-[98] -translate-x-1/2 rounded-full bg-amber-100 px-4 py-1.5 font-mono text-xs text-black">
          {toast}
        </div>
      )}
    </>
  );
}
