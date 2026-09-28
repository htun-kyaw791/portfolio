"use client";

import Image from "next/image";
import { useState } from "react";
import { FaFolder, FaMarkdown } from "react-icons/fa";
import { IoMdArrowDropright } from "react-icons/io";
import { IoGameController, IoPerson, IoTerminal } from "react-icons/io5";
import { aboutSections, type AboutSection } from "@/data/about";
import { site, stats } from "@/data/site";
import { cn } from "@/lib/cn";
import Sidebar from "@/components/ui/Sidebar";
import SidebarSection from "@/components/ui/SidebarSection";
import TabBar from "@/components/ui/TabBar";
import CodeBlock from "@/components/ui/CodeBlock";
import ContactList from "./ContactList";
import TechStack from "./TechStack";
import ExperienceTimeline from "./ExperienceTimeline";

const activityBar: { id: AboutSection; icon: typeof IoTerminal }[] = [
  { id: "professional-info", icon: IoTerminal },
  { id: "personal-info", icon: IoPerson },
  { id: "hobbies", icon: IoGameController },
];

function firstFile(section: AboutSection) {
  const folder = aboutSections[section][0];
  return { folderId: folder.id, fileId: folder.files[0].id };
}

export default function AboutExplorer() {
  // Open on the current role so experience is visible without any clicks.
  const [section, setSection] = useState<AboutSection>("professional-info");
  const [openFolders, setOpenFolders] = useState<string[]>(["experience"]);
  const [active, setActive] = useState(firstFile("professional-info"));

  const folders = aboutSections[section];
  const folder = folders.find((f) => f.id === active.folderId) ?? folders[0];
  const file = folder.files.find((f) => f.id === active.fileId) ?? folder.files[0];

  function selectSection(next: AboutSection) {
    const first = firstFile(next);
    setSection(next);
    setActive(first);
    setOpenFolders([first.folderId]);
  }

  function toggleFolder(id: string) {
    const target = folders.find((f) => f.id === id)!;
    setOpenFolders((open) => (open.includes(id) ? open.filter((o) => o !== id) : [...open, id]));
    // Opening a single-file folder shows it straight away.
    if (target.files.length === 1) setActive({ folderId: id, fileId: target.files[0].id });
  }

  // Render the open file as a JSDoc-style comment block.
  const [heading, ...body] = file.lines;
  const lines = ["/**", ` * ${heading}`, ...body.map((l) => (l ? ` * ${l}` : " *")), " */"];

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
      <p className="px-6 py-6 text-white md:hidden">_about-me</p>

      {/* activity bar */}
      <nav className="flex shrink-0 gap-6 border-b border-line px-6 pb-4 text-2xl md:w-[68px] md:flex-col md:items-center md:border-b-0 md:border-r md:px-0 md:pt-4">
        {activityBar.map(({ id, icon: Icon }) => (
          <button
            key={id}
            type="button"
            title={id}
            aria-label={id}
            aria-pressed={section === id}
            onClick={() => selectSection(id)}
            className={cn("transition-opacity hover:opacity-100", section === id ? "text-white" : "opacity-40")}
          >
            <Icon />
          </button>
        ))}
      </nav>

      <Sidebar className="md:w-[243px]">
        <SidebarSection key={section} title={section}>
          <ul className="space-y-2">
            {folders.map((f) => {
              const open = openFolders.includes(f.id);
              return (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => toggleFolder(f.id)}
                    className={cn("flex w-full items-center gap-2 hover:text-white", f.id === folder.id && "text-white")}
                  >
                    <IoMdArrowDropright className={cn("shrink-0 transition-transform", open && "rotate-90")} />
                    <FaFolder className="shrink-0" style={{ color: f.color }} />
                    {f.label}
                  </button>
                  {open && (
                    <ul className="mt-2 space-y-1 pl-6">
                      {f.files.map((fl) => (
                        <li key={fl.id}>
                          <button
                            type="button"
                            onClick={() => setActive({ folderId: f.id, fileId: fl.id })}
                            className={cn(
                              "flex items-center gap-2 text-sm hover:text-white",
                              fl.id === file.id && f.id === folder.id && "text-white",
                            )}
                          >
                            <FaMarkdown className="shrink-0" /> {fl.label}.md
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </SidebarSection>
        <SidebarSection title="contacts">
          <ContactList />
        </SidebarSection>
      </Sidebar>

      {/* editor */}
      <section className="flex min-w-0 flex-1 flex-col border-line md:border-r">
        <TabBar label={`${folder.label} / ${file.label}.md`} />
        <div className="flex-1 px-6 py-6 md:overflow-y-auto md:px-10">
          <p className="mb-4 md:hidden">
            <span className="text-white">{`// ${section}`}</span> / {folder.label}
          </p>
          <CodeBlock lines={lines} />
        </div>
      </section>

      {/* right panel */}
      <section className="flex min-w-0 flex-1 flex-col">
        <div className="hidden h-10 shrink-0 border-b border-line md:block" />
        <div className="flex-1 space-y-10 px-6 py-6 md:overflow-y-auto md:px-10">
          {section === "professional-info" && (
            <ExperienceTimeline
              activeId={folder.id === "experience" ? file.id : undefined}
              onSelect={(id) => {
                setActive({ folderId: "experience", fileId: id });
                setOpenFolders((open) => (open.includes("experience") ? open : [...open, "experience"]));
              }}
            />
          )}
          {section === "personal-info" && (
            <div className="flex items-center gap-6">
              <Image
                src={site.photo}
                alt={site.name}
                width={112}
                height={112}
                className="size-28 rounded-2xl border border-line object-cover"
              />
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {stats.map((s) => (
                  <div key={s.label}>
                    <dt className="text-xl text-accent-orange">{s.value}</dt>
                    <dd className="text-xs">{s.label}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          <TechStack highlight={file.techs} />
        </div>
      </section>
    </div>
  );
}
