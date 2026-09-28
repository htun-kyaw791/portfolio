import { experiences } from "@/data/experience";
import { cn } from "@/lib/cn";

/** Career at a glance; clicking a role opens its file in the editor. */
export default function ExperienceTimeline({
  activeId,
  onSelect,
}: {
  activeId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="text-sm">
      <p className="mb-6 text-white md:text-text">{"// experience-timeline"}</p>
      <ol className="relative space-y-6 border-l border-line pl-6">
        {experiences.map((e) => (
          <li key={e.id} className="relative">
            <span
              aria-hidden
              className={cn(
                "absolute -left-[29px] top-1.5 size-2.5 rounded-full",
                e.id === activeId ? "bg-accent-orange shadow-[0_0_8px_2px_rgba(254,165,95,0.4)]" : "bg-line",
              )}
            />
            <button type="button" onClick={() => onSelect(e.id)} className="group block text-left">
              <p className="text-xs text-accent-orange">{e.period}</p>
              <p className={cn("mt-1 group-hover:text-white", e.id === activeId ? "text-white" : "text-text-light")}>
                {e.role}
              </p>
              <p className="text-accent-indigo">@ {e.company}</p>
              <p className="mt-2 line-clamp-2 text-xs leading-5">{e.highlights[0]}</p>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
