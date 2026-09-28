import localFont from "next/font/local";

// Fira Code (variable, 300–700) downloaded from Google Fonts and served locally.
export const firaCode = localFont({
  src: "../assets/fonts/FiraCode-Variable.woff2",
  weight: "300 700",
  style: "normal",
  display: "swap",
  variable: "--font-fira-code",
});
