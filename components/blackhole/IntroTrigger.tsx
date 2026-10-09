"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

const Intro = dynamic(() => import("./Intro"), { ssr: false });

const noop = () => () => {};

/** Mounts the intro only when the inline script flagged this page load for it. */
export default function IntroTrigger() {
  const pending = useSyncExternalStore(noop, () => document.documentElement.dataset.intro === "pending", () => false);
  return pending ? <Intro /> : null;
}
