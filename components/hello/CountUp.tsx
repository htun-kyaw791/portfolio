"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

const DURATION = 1100;

/**
 * "5+", "3K", "20+": counts the number up from 0 the first time it scrolls into
 * view. Renders the final value (server and first paint) and animates the text
 * node directly, so there's no hydration mismatch or re-render per frame.
 */
export default function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    const m = value.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
    if (!el || !m || reduced) return;
    const [, prefix, num, suffix] = m;
    const target = parseFloat(num);
    const decimals = num.includes(".") ? num.split(".")[1].length : 0;
    let frame = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / DURATION);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = `${prefix}${(target * eased).toFixed(decimals)}${suffix}`;
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      el.textContent = value;
    };
  }, [value, reduced]);

  return (
    <dt ref={ref} className={className}>
      {value}
    </dt>
  );
}
