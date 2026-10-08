import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { keystaticEnabled } from "@/lib/keystatic-enabled";
import KeystaticApp from "./keystatic";

export const metadata: Metadata = {
  title: "Content admin",
  robots: { index: false, follow: false },
};

export default function KeystaticLayout() {
  if (!keystaticEnabled) notFound();
  return <KeystaticApp />;
}
