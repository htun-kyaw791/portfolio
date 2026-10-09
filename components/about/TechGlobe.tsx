"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { techTypes, type TechType } from "@/lib/taxonomy";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useThemeColors } from "@/lib/useThemeColors";
import type { Tech } from "@/types";

// The tech stack as a sphere of real links: each tech sits on a Fibonacci
// sphere, is rotated and perspective-projected in JS, and placed with a CSS
// transform. Text stays crisp, links stay focusable and crawlable, and no 3D
// library is needed. A canvas behind draws the wireframe.

const TYPE_CLASS: Record<TechType, string> = {
  language: "text-accent-orange",
  framework: "text-accent-green",
  library: "text-accent-indigo",
  database: "text-accent-purple",
  "apis-integration": "text-accent-coral",
  devops: "text-accent-orange",
  "development-tool": "text-text-light",
  "workflow-methodology": "text-text",
};

const AUTO_SPEED = 0.18; // rad/s
const PERSPECTIVE = 2.6; // in sphere radii
const FRICTION = 2.4; // per second, for drag inertia

type Vec = { x: number; y: number; z: number };

function fibonacciSphere(n: number): Vec[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - (2 * (i + 0.5)) / n;
    const r = Math.sqrt(1 - y * y);
    const a = i * golden;
    return { x: Math.cos(a) * r, y, z: Math.sin(a) * r };
  });
}

/** Rotate by yaw (around y) then pitch (around x). */
function rotate(p: Vec, yaw: number, pitch: number): Vec {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const x1 = p.x * cy + p.z * sy;
  const z1 = -p.x * sy + p.z * cy;
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  return { x: x1, y: p.y * cp - z1 * sp, z: p.y * sp + z1 * cp };
}

export default function TechGlobe({
  technos,
  highlight = [],
  usage = {},
}: {
  technos: readonly Tech[];
  highlight?: readonly string[];
  /** tech title → number of projects using it */
  usage?: Readonly<Record<string, number>>;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const reduced = useReducedMotion();
  const colours = useThemeColors();
  const [hovered, setHovered] = useState<number | null>(null);

  const points = useMemo(() => fibonacciSphere(technos.length), [technos.length]);

  // rotation state lives outside React: it changes every frame
  const view = useRef({ yaw: 0.6, pitch: -0.25, vYaw: 0, vPitch: 0, target: null as null | { yaw: number; pitch: number } });
  const drag = useRef<{ x: number; y: number; t: number } | null>(null);
  const paused = useRef(false);
  const live = useRef({ reduced, colours, hovered });
  useEffect(() => {
    live.current = { reduced, colours, hovered };
  });

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    let size = 0;
    let dpr = 1;
    const resize = () => {
      size = wrap.clientWidth;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = canvas.style.height = `${size}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let onScreen = true;
    const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting));
    io.observe(wrap);

    let last = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!onScreen || !size) return;
      const v = view.current;
      const { reduced: still, colours: c, hovered: hover } = live.current;

      // motion: eased turn to a focused label > drag inertia > slow auto-spin
      if (v.target) {
        const dy = Math.atan2(Math.sin(v.target.yaw - v.yaw), Math.cos(v.target.yaw - v.yaw));
        v.yaw += dy * Math.min(1, dt * 6);
        v.pitch += (v.target.pitch - v.pitch) * Math.min(1, dt * 6);
        if (Math.abs(dy) < 0.002) v.target = null;
      } else if (!drag.current) {
        v.yaw += v.vYaw * dt;
        v.pitch += v.vPitch * dt;
        const decay = Math.exp(-FRICTION * dt);
        v.vYaw *= decay;
        v.vPitch *= decay;
        if (!still && !paused.current && Math.abs(v.vYaw) < AUTO_SPEED) v.yaw += AUTO_SPEED * dt;
      }
      v.pitch = Math.max(-1.2, Math.min(1.2, v.pitch));

      const R = size * 0.41;
      const half = size / 2;

      // wireframe
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, size, size);
        ctx.strokeStyle = c.line;
        ctx.lineWidth = 1;
        const project = (p: Vec) => {
          const s = PERSPECTIVE / (PERSPECTIVE - p.z);
          return { x: half + p.x * R * s, y: half - p.y * R * s, z: p.z };
        };
        const ring = (pointAt: (t: number) => Vec) => {
          let prev: ReturnType<typeof project> | null = null;
          for (let i = 0; i <= 48; i++) {
            const q = project(rotate(pointAt((i / 48) * Math.PI * 2), v.yaw, v.pitch));
            if (prev) {
              // back half fainter
              ctx.globalAlpha = (prev.z + q.z) / 2 > 0 ? 0.9 : 0.3;
              ctx.beginPath();
              ctx.moveTo(prev.x, prev.y);
              ctx.lineTo(q.x, q.y);
              ctx.stroke();
            }
            prev = q;
          }
        };
        for (let m = 0; m < 6; m++) {
          const a = (m / 6) * Math.PI;
          ring((t) => ({ x: Math.cos(t) * Math.cos(a), y: Math.sin(t), z: Math.cos(t) * Math.sin(a) }));
        }
        for (const lat of [-0.6, -0.3, 0, 0.3, 0.6]) {
          const r = Math.cos(lat * (Math.PI / 2));
          const y = Math.sin(lat * (Math.PI / 2));
          ring((t) => ({ x: Math.cos(t) * r, y, z: Math.sin(t) * r }));
        }
        ctx.globalAlpha = 1;
      }

      // labels
      points.forEach((p, i) => {
        const el = labelRefs.current[i];
        if (!el) return;
        const q = rotate(p, v.yaw, v.pitch);
        const s = PERSPECTIVE / (PERSPECTIVE - q.z);
        const x = half + q.x * R * s;
        const y = half - q.y * R * s;
        const depth = (q.z + 1) / 2; // 0 back … 1 front
        const isHover = hover === i;
        // the far side recedes to faint, small labels so the front stays readable
        const back = depth < 0.45;
        el.style.transform = `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${(0.55 + depth * 0.6) * (isHover ? 1.25 : 1)})`;
        el.style.opacity = String(isHover ? 1 : back ? 0.12 + depth * 0.2 : 0.3 + depth * 0.7);
        el.style.zIndex = String(Math.round(depth * 100) + (isHover ? 100 : 0));
        el.style.filter = depth < 0.35 ? `blur(${((0.35 - depth) * 3).toFixed(2)}px)` : "";
      });
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
    };
  }, [points]);

  // drag to spin, with inertia
  function onPointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest("a")) return; // let links be clicked
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    view.current.target = null;
  }
  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const size = wrapRef.current?.clientWidth || 300;
    const now = performance.now();
    const dx = ((e.clientX - d.x) / size) * Math.PI;
    const dy = ((e.clientY - d.y) / size) * Math.PI;
    const dt = Math.max((now - d.t) / 1000, 0.001);
    const v = view.current;
    v.yaw += dx;
    v.pitch += dy;
    v.vYaw = dx / dt;
    v.vPitch = dy / dt;
    drag.current = { x: e.clientX, y: e.clientY, t: now };
  }
  function onPointerUp() {
    drag.current = null;
  }

  /** Turn the globe so this label faces the viewer (keyboard focus). */
  function bringToFront(i: number) {
    const p = points[i];
    view.current.target = { yaw: -Math.atan2(p.x, p.z), pitch: Math.atan2(p.y, Math.hypot(p.x, p.z)) };
  }

  const hoveredTech = hovered !== null ? technos[hovered] : null;

  return (
    <div className="space-y-3 text-sm">
      <div
        ref={wrapRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerEnter={() => (paused.current = true)}
        onPointerLeave={() => {
          paused.current = false;
          setHovered(null);
        }}
        className="relative mx-auto aspect-square w-full max-w-[460px] cursor-grab touch-none select-none active:cursor-grabbing"
        aria-label="Tech stack globe: drag to spin"
        role="group"
      >
        <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0" />
        {technos.map((t, i) => {
          const used = highlight.includes(t.title);
          return (
            <a
              key={t.title}
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
              href={t.url || undefined}
              target="_blank"
              rel="noreferrer"
              onPointerEnter={() => setHovered(i)}
              onPointerLeave={() => setHovered((h) => (h === i ? null : h))}
              onFocus={() => {
                setHovered(i);
                bringToFront(i);
              }}
              onBlur={() => setHovered((h) => (h === i ? null : h))}
              className={cn(
                "absolute left-0 top-0 whitespace-nowrap rounded px-1 py-0.5 text-[11px] will-change-transform",
                used ? "bg-accent-green/15 text-accent-green ring-1 ring-accent-green/50" : TYPE_CLASS[t.type],
              )}
            >
              {t.title}
            </a>
          );
        })}
      </div>

      <p className="min-h-10 text-center text-xs">
        {hoveredTech ? (
          <>
            <span className="text-text-light">{hoveredTech.title}</span>
            <span>{` // ${techTypes[hoveredTech.type].replace(/s$/, "")}`}</span>
            {usage[hoveredTech.title] ? (
              <span className="text-accent-green">{` · used in ${usage[hoveredTech.title]} project${usage[hoveredTech.title] > 1 ? "s" : ""}`}</span>
            ) : null}
          </>
        ) : (
          <span>{"// drag to spin · hover a tech · tab through them"}</span>
        )}
      </p>
    </div>
  );
}
