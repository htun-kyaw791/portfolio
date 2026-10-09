"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { usePrefs } from "@/lib/prefs";
import { useReducedMotion } from "@/lib/useReducedMotion";

const BlackHole = dynamic(() => import("./BlackHole"), { ssr: false });

const QUERY = "(min-width: 1024px)";
function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** Opt-in hello background (palette → Preferences: Hero background). Desktop + full motion only. */
export default function HeroBlackHole() {
  const { hero } = usePrefs();
  const reduced = useReducedMotion();
  const desktop = useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
  if (hero !== "blackhole" || reduced || !desktop) return null;
  return (
    <BlackHole
      opaque={false}
      stars={false}
      interactive
      zoom={0.42}
      center={[0.05, -0.1]}
      maxScale={1}
      className="pointer-events-none absolute inset-0 size-full opacity-90"
    />
  );
}
