import { techTypeLabels, technosByType } from "@/data/technos";
import { cn } from "@/lib/cn";

const groups = [...technosByType()];

/** Tech stack as a JSON-ish object; techs used in the open file are highlighted. */
export default function TechStack({ highlight = [] }: { highlight?: string[] }) {
  return (
    <div className="space-y-6 text-sm">
      <p className="text-white md:text-text">
        {"// tech-stack"}
        {highlight.length > 0 && <span className="text-accent-green">{" · highlighted: used here"}</span>}
      </p>
      {groups.map(([type, techs]) => (
        <div key={type}>
          <p className="mb-2">
            <span className="text-accent-indigo">const</span>{" "}
            <span className="text-accent-green">{techTypeLabels[type]}</span>{" "}
            <span className="text-white">=</span> [
          </p>
          <div className="flex flex-wrap gap-2 pl-4">
            {techs.map((t) => (
              <a
                key={t.title}
                href={t.url}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "rounded-md border px-2 py-0.5 text-xs transition-colors hover:text-white",
                  highlight.includes(t.title)
                    ? "border-accent-green/60 bg-accent-green/10 text-accent-green"
                    : "border-line text-accent-coral",
                )}
              >
                &quot;{t.title}&quot;
              </a>
            ))}
          </div>
          <p className="mt-2">]</p>
        </div>
      ))}
    </div>
  );
}
