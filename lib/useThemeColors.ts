"use client";

import { useMemo } from "react";
import { colors as fallback } from "./colors";
import { usePrefs } from "./prefs";

export type ThemeColors = {
  deep: string;
  bg: string;
  line: string;
  text: string;
  light: string;
  white: string;
  orange: string;
  green: string;
  coral: string;
  purple: string;
  indigo: string;
};

const VARS: Record<keyof ThemeColors, string> = {
  deep: "--color-bg-deep",
  bg: "--color-bg",
  line: "--color-line",
  text: "--color-text",
  light: "--color-text-light",
  white: "--color-white",
  orange: "--color-accent-orange",
  green: "--color-accent-green",
  coral: "--color-accent-coral",
  purple: "--color-accent-purple",
  indigo: "--color-accent-indigo",
};

/** Active theme's palette as plain strings, for canvas/WebGL code. Recomputes on theme change. */
export function useThemeColors(): ThemeColors {
  const { theme } = usePrefs();
  return useMemo(() => {
    const base = { ...fallback, white: "#ffffff", purple: "#c98bdf" } as ThemeColors;
    if (typeof window === "undefined") return base;
    const style = getComputedStyle(document.documentElement);
    const out = { ...base };
    for (const [k, v] of Object.entries(VARS) as [keyof ThemeColors, string][]) {
      out[k] = style.getPropertyValue(v).trim() || base[k];
    }
    return out;
    // theme is the trigger: the CSS variables change with it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);
}
