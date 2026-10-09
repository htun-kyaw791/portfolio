"use client";

import { useEffect, useRef } from "react";

/** True when the event comes from somewhere the visitor is typing. */
export function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

/**
 * Global keyboard shortcut. `combo` is like "mod+k" (mod = ⌘ on macOS, Ctrl
 * elsewhere), "mod+shift+p" or "?". Ignored while typing unless `allowInInputs`.
 */
export function useHotkey(
  combo: string | readonly string[],
  handler: (e: KeyboardEvent) => void,
  { allowInInputs = false, enabled = true }: { allowInInputs?: boolean; enabled?: boolean } = {},
) {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });

  const combos = typeof combo === "string" ? [combo] : combo;
  const key = combos.join("|");

  useEffect(() => {
    if (!enabled) return;
    const parsed = key.split("|").map(parseCombo);
    function onKey(e: KeyboardEvent) {
      if (!allowInInputs && isTypingTarget(e.target)) return;
      if (!parsed.some((c) => matches(c, e))) return;
      e.preventDefault();
      handlerRef.current(e);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [key, allowInInputs, enabled]);
}

type Combo = { key: string; mod: boolean; shift: boolean; alt: boolean };

function parseCombo(combo: string): Combo {
  const parts = combo.toLowerCase().split("+");
  return {
    key: parts[parts.length - 1],
    mod: parts.includes("mod"),
    shift: parts.includes("shift"),
    alt: parts.includes("alt"),
  };
}

function matches(c: Combo, e: KeyboardEvent) {
  const mod = e.metaKey || e.ctrlKey;
  return e.key.toLowerCase() === c.key && mod === c.mod && e.shiftKey === c.shift && e.altKey === c.alt;
}

export function isMac() {
  return typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
}
