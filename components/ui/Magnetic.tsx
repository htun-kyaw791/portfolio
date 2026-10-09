"use client";

import { useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

const PULL = 0.28;

/** Leans its child toward the mouse while hovered, then springs back. */
export default function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  return (
    <span
      ref={ref}
      onPointerMove={(e) => {
        if (reduced || e.pointerType !== "mouse") return;
        const el = e.currentTarget;
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transition = "transform 80ms";
        el.style.transform = `translate(${(dx * PULL).toFixed(1)}px, ${(dy * PULL).toFixed(1)}px)`;
      }}
      onPointerLeave={(e) => {
        e.currentTarget.style.transition = "transform 450ms cubic-bezier(0.2, 1.6, 0.4, 1)";
        e.currentTarget.style.transform = "";
      }}
      className="inline-block"
    >
      {children}
    </span>
  );
}
