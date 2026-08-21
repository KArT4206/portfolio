"use client";

import { useEffect, useState } from "react";

const LINES = [
  "KARTHIK.B",
  "INITIALIZING",
  "PROFILE ......... OK",
  "PROJECTS ........ OK",
  "RESEARCH ........ OK",
  "GITHUB .......... SYNC",
  "CONTACT ......... READY",
];

const STORAGE_KEY = "kb-hud-booted";

/**
 * Short, skippable boot readout shown once per browser session (not once
 * ever — sessionStorage clears on tab close, so a returning visitor next
 * session sees it again, but reloading/navigating within a session doesn't
 * replay it). Any key press or click skips it immediately.
 *
 * Starts at `visible=false` on both server and client so the first client
 * render matches the server-rendered HTML — sessionStorage is browser-only,
 * so the real decision has to happen post-mount in an effect (a legitimate
 * "sync with an external system" case, not a derivable-at-render value).
 */
export default function BootSequence() {
  const [visible, setVisible] = useState(false);
  const [lineCount, setLineCount] = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    sessionStorage.setItem(STORAGE_KEY, "1");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- gating on sessionStorage, a browser-only API unavailable during SSR/first hydration render
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      const t = setTimeout(() => {
        setLineCount(LINES.length);
        setVisible(false);
      }, 300);
      return () => clearTimeout(t);
    }

    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setLineCount(i);
      if (i >= LINES.length) {
        clearInterval(interval);
        setTimeout(() => setVisible(false), 300);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    function skip() {
      setVisible(false);
    }
    window.addEventListener("keydown", skip);
    window.addEventListener("click", skip);
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("click", skip);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="hud-boot" role="status" aria-live="polite">
      <div className="w-[280px] px-6">
        {LINES.slice(0, lineCount).map((line, i) => (
          <p
            key={line}
            className="hud-boot__line py-[2px] text-xs tracking-[0.05em] text-accent-green"
            style={{ animationDelay: `${i * 0.02}s` }}
          >
            {line}
          </p>
        ))}
        <p className="mt-[15px] font-mono text-[10px] uppercase tracking-[0.1em] text-dim">
          Press any key to skip
        </p>
      </div>
    </div>
  );
}
