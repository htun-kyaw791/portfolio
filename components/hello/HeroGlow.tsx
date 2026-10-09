"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/** Soft light that follows the mouse across the hello section (mouse only). */
export default function HeroGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    const section = el?.parentElement;
    if (!el || !section || reduced) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = section.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
        el.style.opacity = "1";
      });
    };
    const onLeave = () => (el.style.opacity = "0");
    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 [background:radial-gradient(520px_circle_at_var(--mx,50%)_var(--my,50%),color-mix(in_oklab,var(--color-accent-indigo)_14%,transparent),transparent_70%)]"
    />
  );
}
