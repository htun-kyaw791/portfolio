import { cn } from "@/lib/cn";

/** Renders text as numbered lines, like an editor gutter. */
export default function CodeBlock({ lines, className }: { lines: React.ReactNode[]; className?: string }) {
  return (
    <div className={cn("text-sm leading-7", className)}>
      {lines.map((line, i) => (
        <div key={i} className="flex">
          <span className="w-10 shrink-0 select-none pr-6 text-right">{i + 1}</span>
          <span className="min-w-0 whitespace-pre-wrap break-words">{line}</span>
        </div>
      ))}
    </div>
  );
}
