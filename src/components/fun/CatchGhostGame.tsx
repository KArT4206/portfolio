"use client";

import { useEffect, useState } from "react";
import GameOverlay from "./GameOverlay";

const DURATION = 20;

function randomPos() {
  return { x: 10 + Math.random() * 80, y: 10 + Math.random() * 70 };
}

export default function CatchGhostGame({ onClose }: { onClose: () => void }) {
  const [pos, setPos] = useState(randomPos);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [done, setDone] = useState(false);

  function relocate() {
    setPos(randomPos());
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setDone(true);
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  function catchGhost() {
    if (done) return;
    setScore((s) => s + 1);
    relocate();
  }

  function restart() {
    setScore(0);
    setTimeLeft(DURATION);
    setDone(false);
    relocate();
  }

  return (
    <GameOverlay
      index="005"
      title="Catch the Ghost"
      score={`SCORE ${score} · TIME ${timeLeft}s`}
      controls="CLICK THE GHOST — SCORE"
      onClose={onClose}
    >
      <div className="relative h-[280px] w-full overflow-hidden border border-border-dim bg-black">
        {!done ? (
          <button
            type="button"
            onClick={catchGhost}
            data-cursor="CATCH"
            className="absolute flex h-[36px] w-[36px] cursor-none items-center justify-center transition-[left,top] duration-300 ease-out"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            aria-label="Catch the ghost"
          >
            <svg viewBox="0 0 60 70" className="h-full w-full">
              <path
                d="M10,60 C10,22 18,8 30,8 C42,8 50,22 50,60 C46,53 42,60 38,53 C34,60 30,53 26,60 C22,53 18,60 14,53 C12,57 10,60 10,60 Z"
                fill="rgba(0,255,133,0.15)"
                stroke="#00ff85"
                strokeWidth="1.5"
              />
              <circle cx="23" cy="32" r="3" fill="#00ff85" />
              <circle cx="37" cy="32" r="3" fill="#00ff85" />
            </svg>
          </button>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <p className="font-mono text-sm uppercase tracking-[0.05em] text-accent-green">Ghost caught {score}x</p>
            <p className="font-mono text-xs text-muted">&quot;okay okay... you win.&quot;</p>
          </div>
        )}
      </div>

      <div className="mt-[15px] flex justify-end">
        <button
          type="button"
          onClick={restart}
          className="rounded-full border border-border-dim px-[15px] py-[5px] font-mono text-[11px] uppercase tracking-[0.05em] hover:border-accent-yellow hover:text-accent-yellow"
        >
          Restart
        </button>
      </div>
    </GameOverlay>
  );
}
