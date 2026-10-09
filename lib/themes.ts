// Editor colour themes. The CSS for each lives in app/globals.css as a
// [data-theme="<id>"] block; this list drives the palette and status bar.

export type ThemeId = "night-owl" | "dracula" | "monokai" | "tokyo-night" | "solarized-dark" | "github-light";

export type Theme = {
  id: ThemeId;
  label: string;
  /** Matches --color-bg; used for <meta name="theme-color">. */
  bg: string;
  /** A few accents shown as swatches in the palette. */
  swatches: readonly string[];
};

export const DEFAULT_THEME: ThemeId = "night-owl";

export const themes: readonly Theme[] = [
  { id: "night-owl", label: "Night Owl", bg: "#011627", swatches: ["#fea55f", "#43d9ad", "#e99287", "#6b77d6"] },
  { id: "dracula", label: "Dracula", bg: "#282a36", swatches: ["#ffb86c", "#50fa7b", "#ff79c6", "#bd93f9"] },
  { id: "monokai", label: "Monokai", bg: "#272822", swatches: ["#fd971f", "#a6e22e", "#fa4989", "#66d9ef"] },
  { id: "tokyo-night", label: "Tokyo Night", bg: "#1a1b26", swatches: ["#ff9e64", "#9ece6a", "#f7768e", "#7aa2f7"] },
  { id: "solarized-dark", label: "Solarized Dark", bg: "#002b36", swatches: ["#e0823d", "#859900", "#e56563", "#3794d6"] },
  { id: "github-light", label: "GitHub Light", bg: "#ffffff", swatches: ["#bc4c00", "#1a7f37", "#cf222e", "#0550ae"] },
];

export function isThemeId(v: unknown): v is ThemeId {
  return themes.some((t) => t.id === v);
}

export function getTheme(id: ThemeId): Theme {
  return themes.find((t) => t.id === id) ?? themes[0];
}
