"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export type GhostState =
  | "HIDDEN"
  | "PEEKING"
  | "IDLE"
  | "CURIOUS"
  | "FOLLOWING"
  | "RUNNING_AWAY"
  | "HIDING"
  | "SURPRISED"
  | "SLEEPING"
  | "CELEBRATING";

export type GhostHandle = {
  celebrate: () => void;
  becomeCurious: () => void;
};

const MESSAGES = ["hey", "oops", "you found me", "stop chasing me", "don't tell anyone", "404: ghost missing", "👀"];
const RUN_DISTANCE = 90;
const IDLE_RADIUS = 140;

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

/**
 * Original mascot — a small wireframe ghost with an actual behavior loop,
 * not a static image. Two timers drive it: a fast rAF loop lerps its
 * rendered position toward a "target" (giving the delayed, slightly
 * overshooting follow feel), and a slower behavior timer swaps between
 * states, each of which picks a new target differently.
 */
const Ghost = forwardRef<GhostHandle, { enabled: boolean; onCaught?: () => void; followMode: boolean; onToggleFollow: () => void }>(
  function Ghost({ enabled, followMode, onToggleFollow }, ref) {
    const [pos, setPos] = useState({ x: -200, y: -200 });
    const [state, setState] = useState<GhostState>("HIDDEN");
    const [message, setMessage] = useState<string | null>(null);
    const [clickCount, setClickCount] = useState(0);

    const posRef = useRef(pos);
    const targetRef = useRef({ x: -200, y: -200 });
    const stateRef = useRef<GhostState>("HIDDEN");
    const pointerRef = useRef({ x: -9999, y: -9999 });
    const speedRef = useRef(0.02);
    const reduceMotionRef = useRef(false);

    useImperativeHandle(ref, () => ({
      celebrate() {
        stateRef.current = "CELEBRATING";
        setState("CELEBRATING");
        setTimeout(() => {
          if (stateRef.current === "CELEBRATING") {
            stateRef.current = "IDLE";
            setState("IDLE");
          }
        }, 1800);
      },
      becomeCurious() {
        if (stateRef.current === "HIDDEN") return;
        stateRef.current = "CURIOUS";
        setState("CURIOUS");
      },
    }));

    useEffect(() => {
      if (!enabled) return;
      reduceMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      function pickIdleTarget() {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        targetRef.current = {
          x: clamp(cx + (Math.random() - 0.5) * IDLE_RADIUS * 4, 60, window.innerWidth - 60),
          y: clamp(cy + (Math.random() - 0.5) * IDLE_RADIUS * 2, 100, window.innerHeight - 100),
        };
      }

      function pickCornerTarget() {
        const corners = [
          { x: 40, y: 100 },
          { x: window.innerWidth - 40, y: 100 },
          { x: 40, y: window.innerHeight - 80 },
          { x: window.innerWidth - 40, y: window.innerHeight - 80 },
        ];
        targetRef.current = corners[Math.floor(Math.random() * corners.length)];
      }

      posRef.current = { x: -200, y: 120 };
      pickCornerTarget();

      let behaviorTimeout: ReturnType<typeof setTimeout>;
      function nextBehavior() {
        const s = stateRef.current;
        if (s === "SURPRISED" || s === "CELEBRATING" || followMode) {
          behaviorTimeout = setTimeout(nextBehavior, 1200);
          return;
        }

        const roll = Math.random();
        if (roll < 0.2) {
          stateRef.current = "HIDDEN";
          setState("HIDDEN");
          speedRef.current = 0.06;
          pickCornerTarget();
        } else if (roll < 0.4) {
          stateRef.current = "PEEKING";
          setState("PEEKING");
          speedRef.current = 0.05;
          pickCornerTarget();
        } else if (roll < 0.55) {
          stateRef.current = "SLEEPING";
          setState("SLEEPING");
          speedRef.current = 0.02;
        } else if (roll < 0.8) {
          stateRef.current = "IDLE";
          setState("IDLE");
          speedRef.current = 0.03;
          pickIdleTarget();
        } else {
          stateRef.current = "HIDING";
          setState("HIDING");
          speedRef.current = 0.05;
          pickCornerTarget();
        }

        behaviorTimeout = setTimeout(nextBehavior, 4000 + Math.random() * 5000);
      }
      behaviorTimeout = setTimeout(nextBehavior, 3000);

      function handlePointerMove(e: PointerEvent) {
        pointerRef.current = { x: e.clientX, y: e.clientY };
      }
      window.addEventListener("pointermove", handlePointerMove, { passive: true });

      let rafId = 0;
      function frame() {
        const p = pointerRef.current;
        const cur = posRef.current;
        const dx = cur.x - p.x;
        const dy = cur.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (followMode) {
          targetRef.current = { x: p.x + 26, y: p.y - 10 };
          speedRef.current = 0.12;
          if (stateRef.current !== "FOLLOWING") {
            stateRef.current = "FOLLOWING";
            setState("FOLLOWING");
          }
        } else if (dist < RUN_DISTANCE && p.x > -100 && stateRef.current !== "RUNNING_AWAY" && stateRef.current !== "SURPRISED") {
          stateRef.current = "SURPRISED";
          setState("SURPRISED");
          speedRef.current = 0.2;
          const angle = Math.atan2(dy, dx);
          targetRef.current = {
            x: clamp(cur.x + Math.cos(angle) * 220, 40, window.innerWidth - 40),
            y: clamp(cur.y + Math.sin(angle) * 160, 80, window.innerHeight - 80),
          };
          setTimeout(() => {
            if (stateRef.current === "SURPRISED") {
              stateRef.current = "RUNNING_AWAY";
              setState("RUNNING_AWAY");
            }
          }, 260);
        }

        if (!reduceMotionRef.current) {
          const s = speedRef.current;
          const next = {
            x: cur.x + (targetRef.current.x - cur.x) * s,
            y: cur.y + (targetRef.current.y - cur.y) * s,
          };
          // Slight overshoot: occasionally nudge past target then correct.
          posRef.current = next;
          setPos(next);
        } else {
          posRef.current = targetRef.current;
          setPos(targetRef.current);
        }

        rafId = requestAnimationFrame(frame);
      }
      rafId = requestAnimationFrame(frame);

      return () => {
        cancelAnimationFrame(rafId);
        clearTimeout(behaviorTimeout);
        window.removeEventListener("pointermove", handlePointerMove);
      };
    }, [enabled, followMode]);

    if (!enabled) return null;

    function handleClick() {
      const n = clickCount + 1;
      setClickCount(n);
      setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
      setTimeout(() => setMessage(null), 1800);

      if (followMode) {
        onToggleFollow();
        return;
      }
      if (n >= 5) {
        onToggleFollow();
        setClickCount(0);
      } else {
        stateRef.current = "SURPRISED";
        setState("SURPRISED");
        setTimeout(() => {
          if (stateRef.current === "SURPRISED") {
            stateRef.current = "HIDING";
            setState("HIDING");
          }
        }, 400);
      }
    }

    const visible = state !== "HIDDEN";
    const opacity = state === "PEEKING" || state === "HIDING" ? 0.55 : state === "SLEEPING" ? 0.7 : 1;
    const scale = state === "SURPRISED" ? 1.15 : state === "CELEBRATING" ? 1.2 : 1;

    return (
      <div
        className="pointer-events-none fixed left-0 top-0 z-[120]"
        style={{
          transform: `translate(${pos.x - 22}px, ${pos.y - 22}px) scale(${scale})`,
          opacity: visible ? opacity : 0,
          transition: "opacity 0.4s ease, transform 0.15s ease",
        }}
        aria-hidden
      >
        <button
          type="button"
          onClick={handleClick}
          data-cursor="CATCH"
          className="pointer-events-auto block h-[44px] w-[44px] cursor-none"
          aria-label="A small ghost"
        >
          <svg viewBox="0 0 60 70" className={state === "CELEBRATING" ? "animate-bounce" : ""}>
            <path
              d="M10,60 C10,22 18,8 30,8 C42,8 50,22 50,60 C46,53 42,60 38,53 C34,60 30,53 26,60 C22,53 18,60 14,53 C12,57 10,60 10,60 Z"
              fill="rgba(0,255,133,0.08)"
              stroke="#00ff85"
              strokeWidth="1.5"
            />
            {state === "SLEEPING" ? (
              <>
                <path d="M20,34 q4,-4 8,0" stroke="#00ff85" strokeWidth="1.5" fill="none" />
                <path d="M32,34 q4,-4 8,0" stroke="#00ff85" strokeWidth="1.5" fill="none" />
                <text x="38" y="18" fontSize="8" fill="#00ff85">z</text>
              </>
            ) : (
              <>
                <circle cx="23" cy="32" r={state === "SURPRISED" ? 4 : 3} fill="#00ff85" />
                <circle cx="37" cy="32" r={state === "SURPRISED" ? 4 : 3} fill="#00ff85" />
              </>
            )}
          </svg>
        </button>
        {message && (
          <span className="pointer-events-none absolute left-1/2 top-[-22px] -translate-x-1/2 whitespace-nowrap border border-accent-green bg-black px-[6px] py-[2px] font-mono text-[10px] uppercase tracking-[0.05em] text-accent-green">
            {message}
          </span>
        )}
      </div>
    );
  }
);

export default Ghost;
