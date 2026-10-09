"use client";

import { useSyncExternalStore } from "react";
import { usePrefs } from "./prefs";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** OS setting, overridden by the in-app motion preference. */
export function useReducedMotion() {
  const { motion } = usePrefs();
  const os = useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
  return motion === "reduced" || (motion === "auto" && os);
}
