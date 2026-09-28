import { cn } from "@/lib/cn";

/** Left explorer column shared by the inner pages; pass the width via className. */
export default function Sidebar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <aside className={cn("shrink-0 border-line md:overflow-y-auto md:border-r", className)}>
      {children}
    </aside>
  );
}
