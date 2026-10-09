"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import { isMac } from "@/lib/hotkeys";

const noop = () => () => {};

/** Shortcut hint; `mod` renders ⌘ on Apple devices and Ctrl elsewhere (after hydration). */
export default function Kbd({ mod, children, className }: { mod?: boolean; children: React.ReactNode; className?: string }) {
  const mac = useSyncExternalStore(noop, isMac, () => false);
  return (
    <kbd className={cn("rounded border border-line bg-bg-deep px-1.5 py-0.5 font-mono text-[11px] leading-none text-text", className)}>
      {mod && (mac ? "⌘" : "Ctrl+")}
      {children}
    </kbd>
  );
}
