"use client";

import { useState } from "react";
import { isArchived, projects, projectTypes } from "@/data/projects";
import type { ProjectType } from "@/types";
import Sidebar from "@/components/ui/Sidebar";
import SidebarSection from "@/components/ui/SidebarSection";
import TabBar from "@/components/ui/TabBar";
import ProjectCard from "./ProjectCard";

const counts = Object.fromEntries(
  projectTypes.map((t) => [t, projects.filter((p) => p.type.includes(t)).length]),
) as Record<ProjectType, number>;

export default function ProjectsExplorer() {
  const [selected, setSelected] = useState<ProjectType[]>([]);

  const toggle = (type: ProjectType) =>
    setSelected((s) => (s.includes(type) ? s.filter((t) => t !== type) : [...s, type]));

  // Archived (early learning) projects only show when the "archive" filter is on.
  const visible = selected.length
    ? projects.filter((p) => p.type.some((t) => selected.includes(t)))
    : projects.filter((p) => !isArchived(p));
  const archivedCount = projects.filter(isArchived).length;

  const label = selected.length ? selected.join("; ") : "all-projects";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
      <p className="px-6 py-6 text-white md:hidden">_projects</p>

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
            <button type="button" onClick={() => setSelected([])} className="mt-4 text-sm text-accent-orange hover:underline">
              clear-filters
            </button>
          )}
        </SidebarSection>
      </Sidebar>

      <section className="flex min-w-0 flex-1 flex-col">
        <TabBar label={label} onClose={selected.length ? () => setSelected([]) : undefined} closeLabel="Clear filters" />
        <div className="flex-1 px-6 py-6 md:overflow-y-auto md:p-12">
          <p className="mb-6 md:hidden">
            <span className="text-white">{"// projects"}</span> / {label}
          </p>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((p, i) => (
              <ProjectCard key={p.slug} project={p} index={i} />
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
