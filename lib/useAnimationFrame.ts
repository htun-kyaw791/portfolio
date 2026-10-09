"use client";

import { useEffect, useRef } from "react";

/**
 * Runs `callback(dt)` every frame while `running`. dt is in seconds and capped,
 * so a backgrounded tab doesn't make objects jump through walls on return.
 * The browser already stops rAF in hidden tabs; we also reset the clock.
 */
export function useAnimationFrame(callback: (dt: number) => void, running: boolean) {
  const cb = useRef(callback);
  useEffect(() => {
    cb.current = callback;
  });

  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      cb.current(dt);
      frame = requestAnimationFrame(loop);
    };
    const onVisible = () => {
      last = performance.now();
    };
    frame = requestAnimationFrame(loop);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [running]);
}
