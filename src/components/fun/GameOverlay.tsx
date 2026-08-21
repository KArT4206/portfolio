"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

/**
 * Shared HUD-styled shell every fun overlay (games, terminal) renders
 * inside — same borders/typography/colors as the rest of the cockpit, so
 * none of this reads as a "different app" bolted onto the portfolio.
 * Handles ESC-to-close and focus containment is intentionally loose (not a
 * modal trap) so keyboard nav out of the overlay always still works.
 */
export default function GameOverlay({
  index,
  title,
  score,
  controls,
  onClose,
  children,
}: {
  index: string;
  title: string;
  score?: string;
  controls?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/85 px-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="section-frame w-full max-w-lg bg-black p-[15px] sm:p-[25px]">
        <div className="flex items-center justify-between border-b border-border-dim pb-[10px]">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-dim">FUN / {index}</p>
            <h2 className="mt-[3px] font-display text-lg font-medium uppercase tracking-[0.02em] text-accent-green">
              {title}
            </h2>
          </div>
          <div className="flex items-center gap-[15px]">
            {score && (
              <p className="font-mono text-xs uppercase tracking-[0.05em] text-accent-yellow">{score}</p>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              data-cursor="CLOSE"
              className="text-muted transition-colors hover:text-accent-crimson"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="mt-[15px]">{children}</div>

        <p className="mt-[15px] text-center font-mono text-[10px] uppercase tracking-[0.1em] text-dim">
          {controls ? `${controls}  ·  ` : ""}ESC / Close
        </p>
      </div>
    </div>
  );
}
