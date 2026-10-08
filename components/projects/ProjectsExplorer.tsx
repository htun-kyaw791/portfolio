"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { projectTypes, type ProjectType } from "@/lib/taxonomy";
import type { Project } from "@/types";
import Sidebar from "@/components/ui/Sidebar";
import SidebarSection from "@/components/ui/SidebarSection";
import TabBar from "@/components/ui/TabBar";
import ProjectCard from "./ProjectCard";

/** Early learning projects: hidden from the default list, shown via the "archive" filter. */
const isArchived = (p: Project) => p.type.includes("archive");

/** Reads `?type=web,frontend`, ignoring unknown or repeated values. */
function parseTypes(param: string | null): ProjectType[] {
  const valid = (param ?? "").split(",").filter((t): t is ProjectType => projectTypes.includes(t as ProjectType));
  return [...new Set(valid)];
}

/**
 * Filters live in the URL so a filtered view can be shared and the back button
 * undoes a filter. Reading search params opts this part out of prerendering, so
 * the Suspense fallback — the unfiltered list — is what ships in the static HTML.
 */
export default function ProjectsExplorer({ projects }: { projects: Project[] }) {
  return (
    <Suspense fallback={<ProjectsView projects={projects} selected={[]} onChange={() => {}} />}>
      <UrlProjectsView projects={projects} />
    </Suspense>
  );
}

function UrlProjectsView({ projects }: { projects: Project[] }) {
  const pathname = usePathname();
  const selected = parseTypes(useSearchParams().get("type"));

  // Native pushState integrates with the Next router, so useSearchParams re-renders.
  const onChange = (next: ProjectType[]) =>
    window.history.pushState(null, "", next.length ? `${pathname}?type=${next.join(",")}` : pathname);

  return <ProjectsView projects={projects} selected={selected} onChange={onChange} />;
}

function ProjectsView({
  projects,
  selected,
  onChange,
}: {
  projects: Project[];
  selected: ProjectType[];
  onChange: (next: ProjectType[]) => void;
}) {
  const counts = Object.fromEntries(
    projectTypes.map((t) => [t, projects.filter((p) => p.type.includes(t)).length]),
  ) as Record<ProjectType, number>;

  const toggle = (type: ProjectType) =>
    onChange(selected.includes(type) ? selected.filter((t) => t !== type) : [...selected, type]);
  const clear = () => onChange([]);

  // Archived (early learning) projects only show when the "archive" filter is on.
  const visible = selected.length
    ? projects.filter((p) => p.type.some((t) => selected.includes(t)))
    : projects.filter((p) => !isArchived(p));
  const archivedCount = projects.filter(isArchived).length;

  const label = selected.length ? selected.join("; ") : "all-projects";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
      <h1 className="px-6 py-6 text-white md:sr-only">_projects</h1>

      <Sidebar className="md:w-[311px]">
        <SidebarSection title="projects">
          <ul className="space-y-3">
            {projectTypes.map((type) => {
              const checked = selected.includes(type);
              return (
                <li key={type}>
                  <label className="flex cursor-pointer items-center gap-5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(type)}
                      className="size-4 cursor-pointer accent-text"
                    />
                    <span className={checked ? "flex-1 text-white" : "flex-1"}>{type}</span>
                    <span className="text-xs">{counts[type]}</span>
                  </label>
                </li>
              );
            })}
          </ul>
          {selected.length > 0 && (
            <button type="button" onClick={clear} className="mt-4 text-sm text-accent-orange hover:underline">
              clear-filters
            </button>
          )}
        </SidebarSection>
      </Sidebar>

      <section className="flex min-w-0 flex-1 flex-col">
        <TabBar label={label} onClose={selected.length ? clear : undefined} closeLabel="Clear filters" />
        <div className="flex-1 px-6 py-6 md:overflow-y-auto md:p-12">
          <p className="mb-6 md:hidden">
            <span className="text-white">{"// projects"}</span> / {label}
          </p>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 xl:grid-cols-3">
            {/* Number from the full list so a project keeps its number across filters. */}
            {visible.map((p, i) => (
              <ProjectCard key={p.slug} project={p} number={projects.indexOf(p) + 1} priority={i < 3} />
            ))}
          </div>
          {!selected.includes("archive") && (
            <button type="button" onClick={() => toggle("archive")} className="mt-12 text-sm hover:text-white">
              {`// + ${archivedCount} early learning projects in the archive →`}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
