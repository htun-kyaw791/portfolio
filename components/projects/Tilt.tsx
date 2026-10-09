"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/useReducedMotion";

const MAX_DEG = 6;

/**
 * Card that leans toward the mouse with a soft glare, like a sheet of glass.
 * Mouse only (touch has no hover) and off with reduced motion. Writes CSS
 * variables directly so moving the mouse never re-renders React.
 */
export default function Tilt({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduced || e.pointerType !== "mouse") return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${((0.5 - py) * MAX_DEG * 2).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${((px - 0.5) * MAX_DEG * 2).toFixed(2)}deg`);
    el.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
    el.dataset.tilting = "";
  }

  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    delete el.dataset.tilting;
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn(
        "group/tilt relative [transform:perspective(900px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] transition-transform duration-500 ease-out data-[tilting]:duration-100",
        className,
      )}
    >
      {children}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-data-[tilting]/tilt:opacity-100 [background:radial-gradient(circle_at_var(--gx,50%)_var(--gy,50%),color-mix(in_oklab,var(--color-white)_14%,transparent),transparent_55%)]"
      />
    </div>
  );
}
