"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { contactNav, navItems, site } from "@/data/site";
import { cn } from "@/lib/cn";

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-full items-center border-b-[3px] px-8 transition-colors hover:text-white",
        active ? "border-accent-orange text-white" : "border-transparent",
      )}
    >
      {label}
    </Link>
  );
}

export default function Header() {
  const pathname = usePathname();
  // Remember which page the menu was opened on, so navigating (links, back button) closes it.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;
  const setOpen = (next: boolean) => setOpenedOn(next ? pathname : null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenedOn(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="relative border-b border-line">
      <div className="flex h-14">
        <Link href="/" className="flex flex-1 items-center px-6 md:w-[311px] md:flex-none md:border-r md:border-line">
          {site.handle}
        </Link>

        {/* desktop */}
        <nav aria-label="Main" className="hidden flex-1 md:flex">
          {navItems.map((item) => (
            <div key={item.href} className="border-r border-line">
              <NavLink {...item} active={isActive(item.href)} />
            </div>
          ))}
          <div className="ml-auto border-l border-line">
            <NavLink {...contactNav} active={isActive(contactNav.href)} />
          </div>
        </nav>

        {/* mobile toggle */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(!open)}
          className="ml-auto px-6 text-xl md:hidden"
        >
          {open ? <HiX /> : <HiMenu />}
        </button>
      </div>

      {/* mobile menu */}
      {open && (
        <nav id="mobile-menu" aria-label="Main" className="absolute inset-x-0 top-14 z-50 h-[calc(100dvh-3.5rem)] bg-bg md:hidden">
          {[...navItems, contactNav].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "block border-b border-line px-6 py-4",
                isActive(item.href) && "text-white",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
