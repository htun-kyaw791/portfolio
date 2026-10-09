"use client";

import { useSyncExternalStore } from "react";
import { PREFS_KEY } from "./prefs-script";
import { readStorage, writeStorage } from "./storage";
import { DEFAULT_THEME, getTheme, isThemeId, type ThemeId } from "./themes";

// Visitor preferences: a tiny external store persisted to localStorage.
// The inline script in app/layout.tsx applies theme/motion before first paint;
// this module keeps them in sync afterwards.

export type MotionPref = "auto" | "reduced" | "full";

export type Prefs = {
  theme: ThemeId;
  motion: MotionPref;
  sound: boolean;
  crt: boolean;
};

export const defaultPrefs: Prefs = { theme: DEFAULT_THEME, motion: "auto", sound: false, crt: false };

function sanitize(raw: Partial<Prefs> | null): Prefs {
  const p = { ...defaultPrefs, ...raw };
  return {
    theme: isThemeId(p.theme) ? p.theme : DEFAULT_THEME,
    motion: p.motion === "reduced" || p.motion === "full" ? p.motion : "auto",
    sound: p.sound === true,
    crt: p.crt === true,
  };
}

let current: Prefs | null = null;
const listeners = new Set<() => void>();

function load(): Prefs {
  current ??= sanitize(readStorage<Partial<Prefs> | null>(PREFS_KEY, null));
  return current;
}

/** Reflect prefs on <html> so CSS (themes, reduced motion, CRT) can react. */
export function applyPrefs(p: Prefs) {
  const root = document.documentElement;
  root.dataset.theme = p.theme;
  if (p.motion === "auto") delete root.dataset.motion;
  else root.dataset.motion = p.motion;
  if (p.crt) root.dataset.crt = "";
  else delete root.dataset.crt;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", getTheme(p.theme).bg);
}

export function setPrefs(patch: Partial<Prefs>) {
  current = sanitize({ ...load(), ...patch });
  writeStorage(PREFS_KEY, current);
  applyPrefs(current);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // keep several open tabs in sync
  const onStorage = (e: StorageEvent) => {
    if (e.key !== `hk:${PREFS_KEY}`) return;
    current = null;
    applyPrefs(load());
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(subscribe, load, () => defaultPrefs);
}

export function getPrefs(): Prefs {
  return load();
}

