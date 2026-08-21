"use client";

import { useEffect, useRef, useState } from "react";
import GameOverlay from "./GameOverlay";

const GRID = 18;
const CELL = 16;
const SIZE = GRID * CELL;

type Point = { x: number; y: number };

function randomFood(snake: Point[]): Point {
  let p: Point;
  do {
    p = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
  } while (snake.some((s) => s.x === p.x && s.y === p.y));
  return p;
}

function initialHighScore(): number {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem("kb-snake-highscore") ?? 0);
}

export default function SnakeGame({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(initialHighScore);
  const [gameOver, setGameOver] = useState(false);
  const [running, setRunning] = useState(true);

  const snakeRef = useRef<Point[]>([{ x: 8, y: 8 }]);
  const dirRef = useRef<Point>({ x: 1, y: 0 });
  const nextDirRef = useRef<Point>({ x: 1, y: 0 });
  const foodRef = useRef<Point>({ x: 3, y: 3 });
  const speedRef = useRef(140);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const d = dirRef.current;
      if ((e.key === "ArrowUp" || e.key === "w") && d.y === 0) nextDirRef.current = { x: 0, y: -1 };
      else if ((e.key === "ArrowDown" || e.key === "s") && d.y === 0) nextDirRef.current = { x: 0, y: 1 };
      else if ((e.key === "ArrowLeft" || e.key === "a") && d.x === 0) nextDirRef.current = { x: -1, y: 0 };
      else if ((e.key === "ArrowRight" || e.key === "d") && d.x === 0) nextDirRef.current = { x: 1, y: 0 };
      else if (e.key === " ") setRunning((r) => !r);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    let stopped = false;

    function draw() {
      ctx!.fillStyle = "#000000";
      ctx!.fillRect(0, 0, SIZE, SIZE);
      ctx!.strokeStyle = "rgba(96,96,96,0.25)";
      for (let i = 0; i <= GRID; i++) {
        ctx!.beginPath();
        ctx!.moveTo(i * CELL, 0);
        ctx!.lineTo(i * CELL, SIZE);
        ctx!.stroke();
        ctx!.beginPath();
        ctx!.moveTo(0, i * CELL);
        ctx!.lineTo(SIZE, i * CELL);
        ctx!.stroke();
      }

      const food = foodRef.current;
      ctx!.fillStyle = "#fcff76";
      ctx!.fillRect(food.x * CELL + 2, food.y * CELL + 2, CELL - 4, CELL - 4);

      snakeRef.current.forEach((s, i) => {
        ctx!.fillStyle = i === 0 ? "#00ff85" : "rgba(0,255,133,0.6)";
        ctx!.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
      });
    }

    function tick() {
      if (stopped) return;
      if (!running || gameOver) {
        draw();
        timeoutId = setTimeout(tick, speedRef.current);
        return;
      }

      dirRef.current = nextDirRef.current;
      const head = snakeRef.current[0];
      const newHead = { x: head.x + dirRef.current.x, y: head.y + dirRef.current.y };

      const hitWall = newHead.x < 0 || newHead.y < 0 || newHead.x >= GRID || newHead.y >= GRID;
      const hitSelf = snakeRef.current.some((s) => s.x === newHead.x && s.y === newHead.y);

      if (hitWall || hitSelf) {
        setGameOver(true);
        setHighScore((h) => {
          const next = Math.max(h, score);
          localStorage.setItem("kb-snake-highscore", String(next));
          return next;
        });
        draw();
        timeoutId = setTimeout(tick, speedRef.current);
        return;
      }

      const ateFood = newHead.x === foodRef.current.x && newHead.y === foodRef.current.y;
      const nextSnake = [newHead, ...snakeRef.current];
      if (ateFood) {
        setScore((s) => s + 1);
        foodRef.current = randomFood(nextSnake);
        speedRef.current = Math.max(70, speedRef.current - 3);
      } else {
        nextSnake.pop();
      }
      snakeRef.current = nextSnake;

      draw();
      timeoutId = setTimeout(tick, speedRef.current);
    }
    tick();

    return () => {
      stopped = true;
      clearTimeout(timeoutId);
    };
  }, [running, gameOver, score]);

  function restart() {
    snakeRef.current = [{ x: 8, y: 8 }];
    dirRef.current = { x: 1, y: 0 };
    nextDirRef.current = { x: 1, y: 0 };
    foodRef.current = randomFood(snakeRef.current);
    speedRef.current = 140;
    setScore(0);
    setGameOver(false);
    setRunning(true);
  }

  function setDir(x: number, y: number) {
    const d = dirRef.current;
    if (x !== 0 && d.x === 0) nextDirRef.current = { x, y: 0 };
    if (y !== 0 && d.y === 0) nextDirRef.current = { x: 0, y };
  }

  return (
    <GameOverlay
      index="002"
      title="Snake"
      score={`SCORE ${String(score).padStart(3, "0")} · HIGH ${String(highScore).padStart(3, "0")}`}
      controls="ARROW KEYS / WASD — MOVE"
      onClose={onClose}
    >
      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        className="mx-auto block border border-border-dim"
        style={{ imageRendering: "pixelated" }}
      />

      {gameOver && (
        <p className="mt-[10px] text-center font-mono text-xs uppercase tracking-[0.05em] text-accent-crimson">
          Game over — press restart
        </p>
      )}

      <div className="mt-[15px] flex items-center justify-between">
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          className="rounded-full border border-border-dim px-[15px] py-[5px] font-mono text-[11px] uppercase tracking-[0.05em] hover:border-accent-yellow hover:text-accent-yellow"
        >
          {running ? "Pause" : "Resume"}
        </button>
        <button
          type="button"
          onClick={restart}
          className="rounded-full border border-border-dim px-[15px] py-[5px] font-mono text-[11px] uppercase tracking-[0.05em] hover:border-accent-yellow hover:text-accent-yellow"
        >
          Restart
        </button>
      </div>

      <div className="mt-[15px] grid grid-cols-3 gap-[5px] sm:hidden">
        <div />
        <button type="button" onClick={() => setDir(0, -1)} className="border border-border-dim py-[10px] text-center">↑</button>
        <div />
        <button type="button" onClick={() => setDir(-1, 0)} className="border border-border-dim py-[10px] text-center">←</button>
        <button type="button" onClick={() => setDir(0, 1)} className="border border-border-dim py-[10px] text-center">↓</button>
        <button type="button" onClick={() => setDir(1, 0)} className="border border-border-dim py-[10px] text-center">→</button>
      </div>
    </GameOverlay>
  );
}
