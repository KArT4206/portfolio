"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { buildPath, type Pose } from "./pixelSprites";

export type BuddyHandle = { celebrate: () => void; becomeCurious: () => void };

type Act =
  | "idle" | "walk" | "read" | "laptop" | "dance" | "pushup" | "wave" | "knock" | "sleep"
  | "juggle" | "drink" | "peedance" | "inwc" | "wash" | "angry" | "love" | "dizzy" | "cheer" | "carried";

type Wc = "none" | "open" | "occupied" | "flushing";

const SIZE = 60; // px for the 24-unit viewBox
const IDLE_AFTER = 8000;
const BLADDER_SECONDS = 90;

const CLICK_LINES = [
  "hey! 👋", "that tickles", "I'm debugging, shh", "click the projects, not me 😅",
  "beep boop", "did you hire him yet?", "I run on coffee ☕", "404: personal space not found",
];

const SECTION_LINES: Record<string, string> = {
  about: "fancy spinning circle 👀",
  services: "so many skills",
  freelance: "psst… he's for hire 👀",
  work: "ooh, projects!",
  research: "big brain stuff 🧠",
  awards: "shiny trophies ✨",
  contact: "say hi to him!",
};

const BUSY: Act[] = ["peedance", "inwc", "wash", "carried", "dizzy", "angry"];

function pick<T>(items: [T, number][]): T {
  const total = items.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [v, w] of items) {
    if ((r -= w) <= 0) return v;
  }
  return items[0][0];
}

function playFlush() {
  try {
    const ctx = new AudioContext();
    const len = ctx.sampleRate * 1.4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2400, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 1.4);
    const gain = ctx.createGain();
    gain.gain.value = 0.25;
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start();
    src.onended = () => ctx.close();
  } catch {
    // audio is optional
  }
}

const PixelBuddy = forwardRef<BuddyHandle>(function PixelBuddy(_, ref) {
  const [act, setActState] = useState<Act>("walk");
  const [tick, setTick] = useState(0);
  const [bubble, setBubble] = useState<string | null>(null);
  const [look, setLook] = useState<[number, number]>([1, 1]);
  const [ask, setAsk] = useState(false);
  const [wc, setWcState] = useState<Wc>("none");
  const [flushReady, setFlushReady] = useState(false);
  const [backTo, setBackTo] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [tomb, setTomb] = useState(false);
  const [hearts, setHearts] = useState(0);
  const [actStart, setActStart] = useState(0);

  const spriteRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const tickRef = useRef(0);

  // Everything the animation loop and timers need lives in one mutable
  // engine object, so per-frame work never touches React state.
  const engine = useRef({
    x: -60, h: 0, vx: 0, vh: 0, facing: 1,
    targetX: 120 as number | null, speed: 1.4,
    onArrive: null as null | (() => void),
    dragging: false, pressed: false, dragMoved: false,
    lastPtr: { x: 0, y: 0, t: 0 }, ptrV: { x: 0, y: 0 },
    act: "walk" as Act, wc: "none" as Wc, tomb: false,
    lastInput: Date.now(), bladder: 0.15, asking: false,
    savedScroll: 0, clicks: [] as number[],
    actTimer: 0 as ReturnType<typeof setTimeout> | 0,
    timers: new Set<ReturnType<typeof setTimeout>>(),
    reduce: false, seenSections: new Set<string>(),
    lastScroll: { y: 0, t: 0 }, maxImpact: 0,
  });

  const api = useMemo(() => {
    const e = engine.current;

    const later = (fn: () => void, ms: number) => {
      const id = setTimeout(() => {
        e.timers.delete(id);
        fn();
      }, ms);
      e.timers.add(id);
      return id;
    };

    let bubbleTimer: ReturnType<typeof setTimeout> | null = null;
    const say = (text: string, ms = 2600) => {
      setBubble(text);
      if (bubbleTimer) clearTimeout(bubbleTimer);
      bubbleTimer = later(() => setBubble(null), ms);
    };

    const setAct = (a: Act, ms?: number, after?: () => void) => {
      e.act = a;
      setActState(a);
      setActStart(tickRef.current);
      if (e.actTimer) clearTimeout(e.actTimer);
      e.actTimer = 0;
      if (ms) {
        e.actTimer = later(() => {
          e.actTimer = 0;
          if (after) after();
          else if (e.act === a) setAct("idle");
        }, ms);
      }
    };

    const setWc = (w: Wc) => {
      e.wc = w;
      setWcState(w);
    };

    const walkTo = (x: number, speed = 1.4, act: Act = "walk", onArrive?: () => void) => {
      e.targetX = Math.max(8, Math.min(window.innerWidth - SIZE - 8, x));
      e.speed = speed;
      e.onArrive = onArrive ?? (() => setAct("idle"));
      setAct(act);
    };

    const busy = () => BUSY.includes(e.act) || e.wc !== "none" || e.dragging || e.asking;
    const isIdle = () => Date.now() - e.lastInput > IDLE_AFTER;

    const knock = () => {
      setAct("knock", 1600);
      say("knock knock 🚪 hello??");
      const root = document.documentElement;
      [0, 450].forEach((d) =>
        later(() => {
          root.classList.add("buddy-knock");
          later(() => root.classList.remove("buddy-knock"), 300);
        }, d)
      );
    };

    const doActivity = (name: string) => {
      switch (name) {
        case "stroll":
          walkTo(Math.random() * window.innerWidth);
          break;
        case "read":
          setAct("read", 7000);
          say("📖 reading his resume…");
          break;
        case "laptop":
          setAct("laptop", 7000);
          say("shipping… 💻");
          break;
        case "dance":
          setAct("dance", 5000);
          say("♪ ♫ ♪");
          break;
        case "pushup":
          setAct("pushup", 5600);
          break;
        case "wave":
          setAct("wave", 2600);
          say(isIdle() ? "hello?? anyone there?" : "hi! 👋");
          break;
        case "knock":
          knock();
          break;
        case "sleep":
          setAct("sleep", 30000);
          break;
        case "juggle":
          setAct("juggle", 5000);
          say("look ma, no hands");
          break;
        case "drink":
          setAct("drink", 3000);
          say("glug glug 🥤");
          e.bladder += 0.2;
          break;
        case "blackout":
          setAct("dizzy", 1400);
          say("oops… tripped on a cable 😳");
          later(() => window.dispatchEvent(new CustomEvent("kb:blackout")), 900);
          break;
        default:
          setAct("idle");
      }
    };

    // ---------- washroom ----------
    const flush = (auto: boolean) => {
      setFlushReady(false);
      setWc("flushing");
      if (!auto) {
        playFlush();
        setToast("flushed ✓");
        later(() => setToast(null), 2200);
      }
      later(() => {
        setWc("open");
        e.bladder = 0;
        setAct("wash", 2200, () => {
          setWc("none");
          if (!e.reduce) setBackTo(e.savedScroll);
          later(() => setBackTo(null), 12000);
          walkTo(Math.random() * window.innerWidth * 0.6);
        });
        say(auto ? "nobody flushed for me… 😒" : "much better 😌 *washes hands*", 3200);
      }, 1700);
    };

    const goWC = () => {
      e.asking = false;
      setAsk(false);
      e.savedScroll = window.scrollY;
      setWc("open");
      if (!e.reduce) {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
      }
      say("hurry hurry hurry 🏃");
      walkTo(window.innerWidth - 164, 3.4, "peedance", () => {
        setWc("occupied");
        setAct("inwc");
        say("…", 1800);
        later(() => say("♪ hmm hm hmm ♪", 2400), 2000);
        later(() => {
          setFlushReady(true);
          later(() => {
            if (e.wc === "occupied") flush(true);
          }, 6000);
        }, 3200);
      });
    };

    const startWashroom = () => {
      if (e.wc !== "none" || e.asking) return;
      setAct("peedance");
      say("gotta go!! 😣", 4000);
      if (isIdle()) {
        later(goWC, 2200);
      } else {
        e.asking = true;
        setAsk(true);
      }
    };

    const holdIt = () => {
      e.asking = false;
      setAsk(false);
      e.bladder = 1 - 30 / BLADDER_SECONDS;
      setAct("peedance", 1600);
      say("ok… holding it 😬");
    };

    // ---------- brain ----------
    const think = () => {
      if (e.bladder >= 1 && e.wc === "none" && !e.asking && !e.dragging) {
        startWashroom();
        return;
      }
      if (busy() || e.act === "sleep") return;
      if (isIdle()) {
        doActivity(
          pick<string>([
            ["stroll", 3], ["read", 2], ["laptop", 2], ["dance", 2], ["pushup", 1.5], ["wave", 1.5],
            ["knock", 1], ["sleep", 1.2], ["juggle", 1.5], ["drink", 1], ["blackout", e.tomb ? 0 : 0.6],
          ])
        );
      } else {
        doActivity(pick<string>([["stroll", 3], ["idle", 2], ["wave", 0.6], ["drink", 0.6], ["juggle", 0.5]]));
      }
    };

    // ---------- pointer / input ----------
    const onInput = () => {
      e.lastInput = Date.now();
      if (e.act === "sleep") {
        setAct("cheer", 1400);
        say("*yawn* oh hi!");
      }
    };

    const onSpriteClick = () => {
      if (busy()) return;
      const now = Date.now();
      e.clicks = [...e.clicks.filter((t) => now - t < 2500), now];
      if (e.clicks.length >= 5) {
        e.clicks = [];
        say("HEY! stop it 😤", 2200);
        const far = e.x < window.innerWidth / 2 ? window.innerWidth : 0;
        walkTo(far, 4.5, "angry");
        return;
      }
      setAct("cheer", 900);
      say(CLICK_LINES[Math.floor(Math.random() * CLICK_LINES.length)]);
    };

    const onLanded = (impact: number) => {
      if (impact > 9) {
        setAct("dizzy", 2200);
        say("dizzy… 😵‍💫");
      } else {
        setAct("idle");
        say("wheee!");
      }
    };

    return {
      later, say, setAct, walkTo, busy, doActivity, startWashroom, goWC, holdIt, flush,
      think, onInput, onSpriteClick, onLanded, knock,
    };
  }, []);

  useImperativeHandle(ref, () => ({
    celebrate() {
      if (api.busy()) return;
      api.setAct("cheer", 1800);
      api.say("woohoo! 🎉");
    },
    becomeCurious() {
      if (api.busy()) return;
      api.setAct("wave", 2200);
      api.say("hi! 👋 I'm his buddy");
    },
  }), [api]);

  // Animation loop: writes transforms directly, never React state.
  useEffect(() => {
    const e = engine.current;
    e.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = performance.now();

    // k scales per-frame constants (tuned at 60fps) to real elapsed time.
    const frame = (now: number) => {
      const k = Math.min(4, (now - last) / 16.67);
      last = now;
      const maxX = window.innerWidth - SIZE;
      if (!e.dragging) {
        if (e.h > 0 || e.vh !== 0) {
          e.vh -= 0.7 * k;
          e.x += e.vx * k;
          e.h += e.vh * k;
          e.vx *= Math.pow(0.985, k);
          if (e.x < 0 || e.x > maxX) {
            e.vx = -e.vx * 0.6;
            e.x = Math.max(0, Math.min(maxX, e.x));
          }
          if (e.h <= 0) {
            const impact = -e.vh;
            e.h = 0;
            e.maxImpact = Math.max(e.maxImpact, impact);
            if (impact > 7) {
              e.vh = impact * 0.45;
            } else {
              e.vh = 0;
              e.vx = 0;
              if (e.act === "carried") api.onLanded(e.maxImpact);
              e.maxImpact = 0;
            }
          }
        } else if (e.targetX !== null) {
          const dx = e.targetX - e.x;
          if (e.reduce || Math.abs(dx) <= e.speed * k) {
            e.x = e.targetX;
            e.targetX = null;
            const cb = e.onArrive;
            e.onArrive = null;
            cb?.();
          } else {
            e.facing = Math.sign(dx);
            e.x += Math.sign(dx) * e.speed * k;
          }
        }
      }
      if (spriteRef.current) {
        spriteRef.current.style.transform = `translate3d(${e.x}px, ${-e.h}px, 0) scaleX(${e.facing})`;
      }
      if (bubbleRef.current) {
        const half = ((bubbleRef.current.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0) / 2 + 8;
        const bx = Math.max(half, Math.min(window.innerWidth - half, e.x + SIZE / 2));
        bubbleRef.current.style.transform = `translate3d(${bx}px, ${-e.h - SIZE - 6}px, 0) translateX(-50%)`;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [api]);

  // Sprite frame ticker (~3.5 fps) — the only periodic React update.
  useEffect(() => {
    const id = setInterval(() => {
      tickRef.current += 1;
      setTick(tickRef.current);
    }, 280);
    return () => clearInterval(id);
  }, []);

  // Brain + bladder.
  useEffect(() => {
    const e = engine.current;
    let brain: ReturnType<typeof setTimeout>;
    const schedule = () => {
      brain = setTimeout(() => {
        api.think();
        schedule();
      }, 6000 + Math.random() * 6000);
    };
    schedule();
    const bladder = setInterval(() => {
      if (e.wc === "none" && !e.asking) e.bladder += 1 / BLADDER_SECONDS;
      if (e.bladder >= 1 && !api.busy() && e.act !== "sleep") api.startWashroom();
    }, 1000);
    const timers = e.timers;
    return () => {
      clearTimeout(brain);
      clearInterval(bladder);
      timers.forEach(clearTimeout);
    };
  }, [api]);

  // Global input: idle tracking, eyes follow cursor, fast-scroll wobble.
  useEffect(() => {
    const e = engine.current;
    let lastLook = "";
    const onMove = (ev: PointerEvent) => {
      api.onInput();
      const cx = e.x + SIZE / 2;
      const cy = window.innerHeight - e.h - SIZE / 2;
      const lx = (ev.clientX > cx ? 1 : 0) as 0 | 1;
      const ly = (ev.clientY > cy ? 1 : 0) as 0 | 1;
      const key = `${lx}${ly}`;
      if (key !== lastLook) {
        lastLook = key;
        setLook([lx, ly]);
      }
    };
    const onScroll = () => {
      api.onInput();
      const now = performance.now();
      const v = Math.abs(window.scrollY - e.lastScroll.y) / Math.max(1, now - e.lastScroll.t);
      e.lastScroll = { y: window.scrollY, t: now };
      const svg = svgRef.current;
      if (v > 4 && svg && !svg.classList.contains("buddy-wobble") && !api.busy()) {
        svg.classList.add("buddy-wobble");
        api.say("whoa!! 🌪️", 1200);
        api.later(() => svg.classList.remove("buddy-wobble"), 700);
      }
    };
    const onKey = () => api.onInput();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onKey, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onKey);
    };
  }, [api]);

  // Section commentary.
  useEffect(() => {
    const e = engine.current;
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          const id = en.target.id;
          if (!en.isIntersecting || e.seenSections.has(id) || api.busy()) continue;
          e.seenSections.add(id);
          api.say(SECTION_LINES[id], 2800);
        }
      },
      { threshold: 0.35 }
    );
    Object.keys(SECTION_LINES).forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [api]);

  // Cross-component events: washroom request and power state.
  useEffect(() => {
    const e = engine.current;
    const onWc = () => {
      e.bladder = 1;
      if (!api.busy()) api.startWashroom();
    };
    const onPower = (ev: Event) => {
      const on = (ev as CustomEvent<{ on: boolean }>).detail.on;
      e.tomb = !on;
      setTomb(!on);
      if (!on) {
        api.say("uh oh… power cut 🔦 good thing I packed a torch", 3400);
      } else if (!api.busy()) {
        api.setAct("cheer", 1600);
        api.say("lights! 🎉");
      }
    };
    window.addEventListener("kb:buddy-washroom", onWc);
    window.addEventListener("kb:power", onPower);
    return () => {
      window.removeEventListener("kb:buddy-washroom", onWc);
      window.removeEventListener("kb:power", onPower);
    };
  }, [api]);

  // Dev-only hook for testing activities from the console.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const w = window as unknown as { __buddy?: unknown };
    w.__buddy = {
      do: (name: string) => (name === "washroom" ? api.startWashroom() : api.doActivity(name)),
      state: () => ({ ...engine.current, timers: engine.current.timers.size }),
    };
    return () => {
      delete w.__buddy;
    };
  }, [api]);

  // ---------- pointer handlers on the sprite ----------
  function onPointerDown(ev: React.PointerEvent) {
    const e = engine.current;
    if (e.wc !== "none") return;
    e.pressed = true;
    e.dragMoved = false;
    e.lastPtr = { x: ev.clientX, y: ev.clientY, t: performance.now() };
    (ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);
  }

  function onPointerMove(ev: React.PointerEvent) {
    const e = engine.current;
    if (!e.pressed) return;
    const dist = Math.hypot(ev.clientX - e.lastPtr.x, ev.clientY - e.lastPtr.y);
    if (!e.dragging && dist < 5) return;
    if (!e.dragging) {
      e.dragging = true;
      e.dragMoved = true;
      e.targetX = null;
      api.setAct("carried");
      api.say("put me down!! 😱", 1600);
    }
    const now = performance.now();
    const dt = Math.max(1, now - e.lastPtr.t);
    e.ptrV = { x: ((ev.clientX - e.lastPtr.x) / dt) * 16, y: ((ev.clientY - e.lastPtr.y) / dt) * 16 };
    e.lastPtr = { x: ev.clientX, y: ev.clientY, t: now };
    e.x = ev.clientX - SIZE / 2;
    e.h = Math.max(0, window.innerHeight - ev.clientY - SIZE / 2);
  }

  function onPointerUp() {
    const e = engine.current;
    e.pressed = false;
    if (e.dragging) {
      e.dragging = false;
      e.vx = Math.max(-30, Math.min(30, e.ptrV.x));
      e.vh = Math.max(-30, Math.min(30, -e.ptrV.y));
      if (e.h <= 0 && Math.abs(e.vh) < 1) api.onLanded(0);
      return;
    }
    if (!e.dragMoved) api.onSpriteClick();
  }

  // ---------- pose ----------
  const pose: Pose = useMemo(() => {
    const alt = tick % 2 === 0;
    const blink = tick % 13 === 0;
    const base: Pose = { look, eyes: blink ? "closed" : "open", mouth: "smile", legs: "stand", props: [] };
    const p: Pose = (() => {
      switch (act) {
        case "walk": return { ...base, legs: alt ? "walk1" : "walk2" };
        case "angry": return { ...base, eyes: "angry", mouth: "flat", legs: alt ? "walk1" : "walk2" };
        case "read": return { ...base, legs: "sit", look: [1, 1], props: ["book"] };
        case "laptop": return { ...base, legs: "sit", mouth: "flat", look: [alt ? 0 : 1, 1], props: ["laptop"] };
        case "dance": return { ...base, mouth: "grin", legs: alt ? "walk1" : "walk2", props: alt ? ["armsUp"] : [] };
        case "pushup": return { ...base, mouth: alt ? "flat" : "o", legs: "air", props: ["pushup", "sweat"] };
        case "wave": return { ...base, mouth: "grin", props: alt ? ["wave"] : [] };
        case "knock": return { ...base, eyes: "wide", mouth: "o", props: alt ? ["wave"] : [] };
        case "sleep": return { ...base, eyes: "closed", mouth: "o", legs: "sit" };
        case "juggle": return { ...base, look: [alt ? 0 : 1, 0], mouth: "grin", props: ["armsUp"] };
        case "drink": return { ...base, eyes: "closed", props: ["cup"] };
        case "peedance": return { ...base, eyes: "wide", mouth: "flat", legs: alt ? "cross1" : "cross2", props: ["sweat"] };
        case "wash": return { ...base, eyes: "closed", mouth: "grin", props: alt ? ["armsUp"] : [] };
        case "love": return { ...base, eyes: "closed", mouth: "grin" };
        case "dizzy": return { ...base, eyes: "dizzy", mouth: "o" };
        case "cheer": return { ...base, mouth: "grin", legs: alt ? "air" : "stand", props: ["armsUp"] };
        case "carried": return { ...base, eyes: "wide", mouth: "o", legs: "air" };
        default: return base;
      }
    })();
    if (tomb) {
      const keep = (p.props ?? []).filter((x) => x !== "wave" && x !== "armsUp" && x !== "cup");
      return { ...p, props: [...keep, "helmet", "torch"] };
    }
    return p;
  }, [act, tick, look, tomb]);

  const paths = useMemo(() => buildPath(pose), [pose]);

  const derivedBubble =
    act === "pushup"
      ? `${Math.floor((tick - actStart) / 2) + 1}…`
      : act === "sleep"
      ? ["z", "zZ", "zZz"][Math.floor(tick / 3) % 3]
      : null;
  const shownBubble = bubble ?? derivedBubble;

  const doorX = typeof window === "undefined" ? 0 : window.innerWidth - 170;

  return (
    <>
      <div
        ref={spriteRef}
        className="pointer-events-none fixed bottom-0 left-0 z-[96] text-white mix-blend-difference"
        style={{ width: SIZE, height: SIZE, visibility: act === "inwc" ? "hidden" : "visible", transformOrigin: "center" }}
      >
        <div
          role="button"
          tabIndex={0}
          aria-label="Pixel buddy — click to say hi, drag to throw"
          className="pointer-events-auto h-full w-full cursor-grab touch-none select-none active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerEnter={(ev) => {
            if (ev.pointerType !== "mouse" || api.busy() || act === "sleep") return;
            api.setAct("love", 1400);
            setHearts((n) => n + 1);
          }}
          onKeyDown={(ev) => {
            if (ev.key === "Enter" || ev.key === " ") api.onSpriteClick();
          }}
        >
          <svg
            ref={svgRef}
            viewBox="-4 -4 24 24"
            width={SIZE}
            height={SIZE}
            shapeRendering="crispEdges"
            className={act === "pushup" && tick % 2 ? "translate-y-[4px]" : act === "dizzy" ? "buddy-dizzy" : undefined}
            aria-hidden
          >
            <path d={paths.body} fill="currentColor" />
            {paths.accent && <path d={paths.accent} fill="currentColor" opacity={0.45} />}
          </svg>
          {act === "juggle" && (
            <div aria-hidden className="absolute left-1/2 top-[-6px] h-0 w-0">
              {[0, 1, 2].map((i) => (
                <span key={i} className="buddy-ball absolute block h-[5px] w-[5px] bg-current" style={{ animationDelay: `${i * 0.25}s` }} />
              ))}
            </div>
          )}
          {hearts > 0 && act === "love" && (
            <div key={hearts} aria-hidden className="absolute left-1/2 top-0">
              {[0, 1, 2].map((i) => (
                <span key={i} className="buddy-heart absolute text-xs" style={{ left: (i - 1) * 14, animationDelay: `${i * 0.12}s` }}>
                  ♥
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div ref={bubbleRef} className="pointer-events-none fixed bottom-0 left-0 z-[97]" aria-live="polite">
        {(shownBubble || ask) && (
          <div className="pointer-events-auto whitespace-nowrap rounded-xl border-2 border-black bg-white px-3 py-1.5 font-mono text-[12px] text-black shadow-[3px_3px_0_#000]">
            {ask ? (
              <div className="flex flex-col items-center gap-1.5">
                <span>gotta go!! come with me? 🚽</span>
                <div className="flex gap-1.5">
                  <button type="button" onClick={api.goWC} className="rounded bg-black px-2 py-0.5 text-white">
                    let&apos;s go
                  </button>
                  <button type="button" onClick={api.holdIt} className="rounded border border-black px-2 py-0.5">
                    hold it
                  </button>
                </div>
              </div>
            ) : (
              shownBubble
            )}
          </div>
        )}
      </div>

      {wc !== "none" && (
        <div className="fixed bottom-0 z-[95]" style={{ left: doorX }}>
          {flushReady && (
            <button
              type="button"
              onClick={() => api.flush(false)}
              className="absolute -top-12 left-1/2 -translate-x-1/2 animate-bounce whitespace-nowrap rounded-full border-2 border-black bg-white px-3 py-1 font-mono text-xs text-black shadow-[3px_3px_0_#000]"
            >
              🚽 Flush?
            </button>
          )}
          <svg viewBox="0 0 24 34" width={72} height={102} shapeRendering="crispEdges" aria-label="Washroom">
            <path d="M0 0h24v34H0z" fill="black" />
            <path d="M1 1h22v1H2v32H1zM22 2h1v32h-1z" fill="white" />
            {wc === "open" ? (
              <path d="M2 2h5v32H2z" fill="white" opacity={0.7} />
            ) : (
              <>
                <path d="M3 3h18v31H3z" fill="white" />
                <path d="M17 18h2v2h-2z" fill="black" />
                <text x="12" y="10" textAnchor="middle" fontSize="5" fontFamily="monospace" fontWeight="bold" fill="black">
                  WC
                </text>
                {wc === "occupied" && (
                  <text x="12" y="27" textAnchor="middle" fontSize="2.6" fontFamily="monospace" fill="black">
                    OCCUPIED
                  </text>
                )}
              </>
            )}
          </svg>
          {wc === "flushing" && (
            <div aria-hidden className="buddy-swirl absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-dashed border-sky-400" />
          )}
        </div>
      )}

      {backTo !== null && (
        <button
          type="button"
          onClick={() => {
            window.scrollTo({ top: backTo, behavior: "smooth" });
            setBackTo(null);
          }}
          className="fixed left-1/2 top-20 z-[98] -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-black bg-white px-4 py-1.5 font-mono text-xs text-black shadow-[3px_3px_0_#000]"
        >
          ↑ back to where you were
        </button>
      )}

      {toast && (
        <div role="status" className="fixed bottom-28 left-1/2 z-[98] -translate-x-1/2 rounded-full bg-white px-4 py-1.5 font-mono text-xs text-black">
          {toast}
        </div>
      )}
    </>
  );
});

export default PixelBuddy;
