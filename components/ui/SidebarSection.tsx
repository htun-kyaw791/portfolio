"use client";

import { useState } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { cn } from "@/lib/cn";

/** Collapsible sidebar group, e.g. "▾ personal-info". */
export default function SidebarSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-b border-line">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 border-b border-line bg-line/40 px-4 py-2 text-white md:bg-transparent"
      >
        <IoMdArrowDropdown className={cn("text-xl transition-transform", !open && "-rotate-90")} />
        {title}
      </button>
      {/* grid-rows 0fr → 1fr animates to the content's real height */}
      <div
        inert={!open}
        className={cn("grid transition-[grid-template-rows] duration-300 ease-out", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
      >
        <div className="overflow-hidden">
          <div className="px-4 py-3">{children}</div>
        </div>
      </div>
    </section>
  );
}
