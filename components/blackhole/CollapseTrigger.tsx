"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { BLACKHOLE } from "@/lib/events";
import { isTypingTarget } from "@/lib/hotkeys";

// Always mounted and tiny: waits for the black hole event or the Konami code,
// and only then loads the animation + WebGL code.
const Collapse = dynamic(() => import("./Collapse"), { ssr: false });

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

export default function CollapseTrigger() {
  const [signal, setSignal] = useState(0);

  // fetch the code while idle so the first summon starts on time
  useEffect(() => {
    const prefetch = () => void import("./Collapse");
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(prefetch, { timeout: 8000 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(prefetch, 4000);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const fire = () => setSignal((n) => n + 1);
    let i = 0;
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      i = key === KONAMI[i] ? i + 1 : key === KONAMI[0] ? 1 : 0;
      if (i === KONAMI.length) {
        i = 0;
        fire();
      }
    };
    window.addEventListener(BLACKHOLE, fire);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(BLACKHOLE, fire);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return signal > 0 ? <Collapse signal={signal} /> : null;
}
