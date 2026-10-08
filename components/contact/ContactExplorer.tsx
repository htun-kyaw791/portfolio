"use client";

import { useState } from "react";
import type { Profile, SocialLink } from "@/types";
import Sidebar from "@/components/ui/Sidebar";
import SidebarSection from "@/components/ui/SidebarSection";
import SocialIcon from "@/components/ui/SocialIcon";
import TabBar from "@/components/ui/TabBar";
import ContactList from "@/components/about/ContactList";
import ContactForm, { type ContactValues } from "./ContactForm";
import CodePreview from "./CodePreview";

export default function ContactExplorer({ profile, links }: { profile: Profile; links: SocialLink[] }) {
  const [values, setValues] = useState<ContactValues>({ name: "", email: "", message: "" });

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
      <h1 className="px-6 py-6 text-white md:sr-only">_contact-me</h1>

      <Sidebar className="md:w-[311px]">
        <SidebarSection title="contacts">
          <ContactList profile={profile} />
        </SidebarSection>
        <SidebarSection title="find-me-also-in">
          <ul className="space-y-2 text-sm">
            {links.map((l) => (
              <li key={l.name}>
                <a href={l.href} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white">
                  <SocialIcon icon={l.icon} /> {l.name}
                </a>
              </li>
            ))}
          </ul>
        </SidebarSection>
      </Sidebar>

      <section className="flex min-w-0 flex-1 flex-col">
        <TabBar label="contacts" />
        <div className="flex flex-1 md:overflow-hidden">
          <div className="flex flex-1 justify-center border-line px-6 py-10 md:overflow-y-auto lg:border-r">
            <ContactForm email={profile.email} values={values} onChange={setValues} />
          </div>
          <div className="hidden flex-1 px-10 py-10 lg:block lg:overflow-y-auto">
            <CodePreview values={values} />
          </div>
        </div>
      </section>
    </div>
  );
}
