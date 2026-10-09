"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { INTRO_KEY } from "@/lib/prefs-script";
import BlackHole, { type BlackHoleParams } from "./BlackHole";
import { collectPieces, spiralFrames } from "./pieces";

// First page of a session: a black hole forms in the dark while hksh boots,
// then the page is thrown out of it, every piece spiralling to its place.
// Click or Esc skips. Only mounted when the inline script set data-intro.

const BOOT_MS = 1300;
const EMIT_MS = 1500;
const LINES = ["hksh boot v1.0", "[ OK ] singularity online", "[ OK ] loading portfolio from beyond the event horizon…"];

type Phase = "boot" | "emit" | "done";

export default function Intro() {
  const [phase, setPhase] = useState<Phase>("boot");
  const [shown, setShown] = useState(0);
  const params = useRef<BlackHoleParams>({ zoom: 0.05 });
  const animations = useRef<Animation[]>([]);
  const timers = useRef<number[]>([]);
  const finished = useRef(false);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    timers.current.forEach(clearTimeout);
    animations.current.forEach((a) => a.finish());
    document.documentElement.dataset.intro = "done";
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      // storage blocked: it may play again next page load, that's fine
    }
    setPhase("done");
  }, []);

  useEffect(() => {
    const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
    LINES.forEach((_, i) => later(() => setShown(i + 1), 150 + i * 280));

    // the hole grows during boot, then shrinks away while the page comes out
    const t0 = performance.now();
    let frame = 0;
    const zoom = (now: number) => {
      const t = now - t0;
      params.current.zoom =
        t < BOOT_MS ? 0.05 + Math.pow(t / BOOT_MS, 0.6) * 0.75 : Math.max(0.001, 0.8 * (1 - Math.pow((t - BOOT_MS) / EMIT_MS, 1.4)));
      if (t < BOOT_MS + EMIT_MS) frame = requestAnimationFrame(zoom);
    };
    frame = requestAnimationFrame(zoom);

    later(() => {
      // reveal the frame; pieces start at the centre (fill: backwards) and fly out
      const root = document.querySelector("[data-frame]");
      document.documentElement.dataset.intro = "playing";
      setPhase("emit");
      if (!root) return;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      animations.current = collectPieces(root).map((el) => {
        const r = el.getBoundingClientRect();
        const dist = Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy);
        return el.animate(spiralFrames(el, cx, cy, "out"), {
          duration: EMIT_MS - 300 + Math.min(dist, 600) * 0.4,
          delay: Math.random() * 200,
          easing: "cubic-bezier(0.2, 0.7, 0.3, 1)",
          fill: "backwards",
          composite: "add",
        });
      });
    }, BOOT_MS);
    later(finish, BOOT_MS + EMIT_MS + 450);

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && finish();
    window.addEventListener("keydown", onKey);
    const pending = timers.current;
    return () => {
      cancelAnimationFrame(frame);
      pending.forEach(clearTimeout);
      window.removeEventListener("keydown", onKey);
    };
  }, [finish]);

  if (phase === "done") return null;

  return (
    <div
      data-collapse-ignore
      aria-hidden
      onClick={finish}
      className={`fixed inset-0 z-[100] transition-colors duration-700 ${phase === "boot" ? "bg-bg-deep" : "bg-transparent"}`}
    >
      <BlackHole opaque={false} stars={phase === "boot"} params={params} maxScale={1} className="absolute inset-0 size-full" />
      <div
        className={`absolute bottom-6 left-6 font-mono text-xs leading-6 text-text transition-opacity duration-300 ${phase === "boot" ? "opacity-100" : "opacity-0"}`}
      >
        {LINES.slice(0, shown).map((l) => (
          <p key={l}>
            {l.startsWith("[ OK ]") ? (
              <>
                [ <span className="text-accent-green">OK</span> ]{l.slice(6)}
              </>
            ) : (
              l
            )}
          </p>
        ))}
      </div>
      <p className="absolute bottom-6 right-6 text-xs text-text/60">click to skip</p>
    </div>
  );
}
