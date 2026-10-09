"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "@/lib/events";
import { sfx } from "@/lib/sound";
import { useReducedMotion } from "@/lib/useReducedMotion";
import BlackHole, { type BlackHoleParams } from "./BlackHole";

// "rm -rf /", the Konami code or the palette: the page's own elements spiral
// into a black hole, the screen goes dark, a fake kernel panic boots the site
// back up, and everything is restored exactly as it was. Esc skips.

const PULL_MS = 2600;
const LINE_MS = 120;

type Phase = "idle" | "pull" | "panic" | "fade";

const REPLACED = new Set(["IMG", "SVG", "CANVAS", "VIDEO", "INPUT", "TEXTAREA", "SELECT", "BUTTON", "IFRAME"]);

/** Has a box you can see on its own: background, border or shadow. */
function hasVisualBox(style: CSSStyleDeclaration) {
  const bg = style.backgroundColor;
  return (
    (bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") ||
    style.backgroundImage !== "none" ||
    parseFloat(style.borderTopWidth) + parseFloat(style.borderLeftWidth) > 0 ||
    style.boxShadow !== "none"
  );
}

/**
 * The pieces that get pulled in: walking down from the frame, an element is
 * taken whole when it's small enough and either looks like a box (cards, the
 * arcade console, buttons) or has nothing further to split into. Big plain
 * wrappers are split into their children. Inline elements can't be
 * transformed, so they always travel with their block.
 */
function collectPieces(root: Element) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const maxArea = vw * vh * 0.33;
  const pieces: Element[] = [];

  const visit = (el: Element) => {
    if (pieces.length >= 500 || el.closest("[data-collapse-ignore]")) return;
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return;
    const r = el.getBoundingClientRect();
    const onScreen = r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < vh && r.left < vw;
    const children = [...el.children];
    if (style.display === "contents") return children.forEach(visit);
    if (!onScreen) return;
    if (style.display === "inline") return; // moves with its parent block

    const blockKids = children.filter((c) => getComputedStyle(c).display !== "inline");
    const small = r.width * r.height <= maxArea;
    if (small && (hasVisualBox(style) || REPLACED.has(el.tagName.toUpperCase()) || blockKids.length === 0)) {
      pieces.push(el);
      return;
    }
    if (blockKids.length === 0) {
      pieces.push(el); // a big text block: still one piece
      return;
    }
    blockKids.forEach(visit);
  };

  [...root.children].forEach(visit);
  return pieces;
}

function spiralFrames(el: Element, cx: number, cy: number): Keyframe[] {
  const r = el.getBoundingClientRect();
  const ex = r.left + r.width / 2;
  const ey = r.top + r.height / 2;
  const vx = ex - cx;
  const vy = ey - cy;
  const turn = (Math.atan2(vy, vx) > 0 ? 1 : -1) * (1.6 + Math.random() * 0.8);
  const frames: Keyframe[] = [];
  const N = 8;
  for (let k = 0; k <= N; k++) {
    const t = k / N;
    const s = t * t * t; // slow start, then falls in
    const a = s * turn * Math.PI;
    const shrink = 1 - s;
    const px = cx + (vx * Math.cos(a) - vy * Math.sin(a)) * shrink;
    const py = cy + (vx * Math.sin(a) + vy * Math.cos(a)) * shrink;
    frames.push({
      transform: `translate(${px - ex}px, ${py - ey}px) rotate(${(a * 180) / Math.PI}deg) scale(${Math.max(0.02, 1 - s * 0.98)}, ${Math.max(0.02, 1 - s * 0.99 - (t > 0.6 ? 0.2 : 0))})`,
      opacity: t < 0.75 ? 1 : 1 - (t - 0.75) / 0.25,
      offset: t,
    });
  }
  return frames;
}

function panicLines(count: number, theme: string) {
  return [
    `[    0.000000] gravitational anomaly detected in /dev/portfolio`,
    `[    0.000412] event horizon crossed: ${count.toLocaleString()} DOM nodes lost`,
    `[    0.001337] hawking radiation: 0 bytes recovered`,
    `Kernel panic - not syncing: Attempted to kill init! exitcode=0x0000dead`,
    `---[ end Kernel panic - not syncing ]---`,
    ``,
    `Rebooting hksh…`,
    `[  OK  ] Mounted /projects`,
    `[  OK  ] Started theme.service (${theme})`,
    `[  OK  ] Restored ${count.toLocaleString()} nodes from git stash`,
    `[  OK  ] Reached target hire-me.target`,
  ];
}

export default function Collapse({ signal }: { signal: number }) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [lines, setLines] = useState<string[]>([]);
  const [shown, setShown] = useState(0);
  const params = useRef<BlackHoleParams>({ zoom: 0.02 });
  const animations = useRef<Animation[]>([]);
  const timers = useRef<number[]>([]);
  const focusBefore = useRef<Element | null>(null);
  const running = phase !== "idle";

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const restore = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    animations.current.forEach((a) => a.cancel());
    animations.current = [];
    setPhase("fade");
    timers.current.push(
      window.setTimeout(() => {
        setPhase("idle");
        setLines([]);
        setShown(0);
        params.current.zoom = 0.02;
        if (focusBefore.current instanceof HTMLElement) focusBefore.current.focus({ preventScroll: true });
        toast("system restored. no pixels were harmed.");
      }, 500),
    );
  }, []);

  const summon = useCallback(() => {
    if (running) return;
    focusBefore.current = document.activeElement;
    const root = document.querySelector("[data-frame]") ?? document.body;
    const pieces = collectPieces(root);
    const swallowed = pieces.reduce((n, el) => n + 1 + el.querySelectorAll("*").length, 0);
    const theme = document.documentElement.dataset.theme ?? "night-owl";
    setLines(panicLines(swallowed, theme));
    setShown(0);
    sfx.lose();

    const startPanic = () => {
      setPhase("panic");
      const total = panicLines(swallowed, theme).length;
      for (let i = 1; i <= total; i++) later(() => setShown(i), i * LINE_MS);
      later(restore, total * LINE_MS + 1100);
    };

    if (reduced) {
      // no spiralling: a still black hole for a moment, then the panic screen
      params.current.zoom = 1;
      setPhase("pull");
      later(startPanic, 1600);
      return;
    }

    setPhase("pull");
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    animations.current = pieces.map((el) => {
      const r = el.getBoundingClientRect();
      const dist = Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy);
      const delay = Math.random() * 350 + (1 - Math.min(dist / 900, 1)) * 250;
      return el.animate(spiralFrames(el, cx, cy), {
        duration: PULL_MS - 600 + Math.min(dist, 600) * 0.6,
        delay,
        easing: "cubic-bezier(0.5, 0, 0.75, 0)",
        fill: "forwards",
        // on top of any transform the element already has (centering, etc.)
        composite: "add",
      });
    });

    // the hole appears, feeds, then swallows the screen
    const t0 = performance.now();
    const grow = (now: number) => {
      const t = (now - t0) / PULL_MS;
      if (t >= 1.25) return;
      const z = t < 0.25 ? 0.02 + (t / 0.25) * 0.5 : t < 0.85 ? 0.52 + (t - 0.25) * 0.5 : 0.82 + Math.pow((t - 0.85) / 0.4, 3) * 25;
      params.current.zoom = z;
      requestAnimationFrame(grow);
    };
    requestAnimationFrame(grow);
    later(startPanic, PULL_MS * 1.25);
  }, [reduced, restore, running]);

  // each bump of `signal` (from CollapseTrigger) runs the effect once
  useEffect(() => {
    if (signal <= 0) return;
    // next frame: lets the overlay mount before pieces are measured
    const id = requestAnimationFrame(summon);
    return () => cancelAnimationFrame(id);
    // summon is intentionally not a dependency: only a new signal should fire it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signal]);

  // Esc skips
  useEffect(() => {
    if (!running || phase === "fade") return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && restore();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, phase, restore]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      animations.current.forEach((a) => a.cancel());
    },
    [],
  );

  if (!running) return null;

  return (
    <div
      data-collapse-ignore
      role="alertdialog"
      aria-label="Black hole easter egg. Press Escape to skip."
      className={`fixed inset-0 z-[100] transition-opacity duration-500 ${phase === "fade" ? "opacity-0" : "opacity-100"}`}
      onClick={restore}
    >
      {phase === "pull" && <BlackHole opaque={false} stars={false} params={params} maxScale={1} className="absolute inset-0 size-full" />}
      {(phase === "panic" || phase === "fade") && (
        // a real console is the same colours whatever the theme
        <div className="absolute inset-0 overflow-hidden bg-black p-6 font-mono text-xs leading-6 text-[#c7c7c7] sm:p-10 sm:text-sm">
          {lines.slice(0, shown).map((l, i) => (
            <p key={i} className="whitespace-pre-wrap">
              {l.startsWith("[  OK  ]") ? (
                <>
                  [ <span className="text-[#43d9ad]">OK</span> ]{l.slice(8)}
                </>
              ) : l.startsWith("Kernel panic") || l.startsWith("---[") ? (
                <span className="text-[#e99287]">{l}</span>
              ) : (
                l
              )}
            </p>
          ))}
          <span className="inline-block h-4 w-2 animate-pulse bg-[#c7c7c7] align-middle" />
        </div>
      )}
      <p className="absolute bottom-4 right-4 text-xs text-white/50">esc to skip</p>
    </div>
  );
}
