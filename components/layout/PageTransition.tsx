import { ViewTransition } from "react";

/**
 * Wrap a page's content so tab-to-tab navigation slides like switching editor
 * tabs. Must sit in each page.tsx (layouts persist, so they never enter/exit).
 * Navigations without a type (browser back, refresh) don't animate.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
