import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { findMeAlso, getProfile } from "@/lib/content";
import ContactExplorer from "@/components/contact/ContactExplorer";
import PageTransition from "@/components/layout/PageTransition";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getProfile();
  return pageMetadata({
    title: "Contact",
    description: `Get in touch with ${site.name}, ${site.role}${site.location ? ` in ${site.location}` : ""} — email, phone, GitHub and LinkedIn.`,
    path: "/contact-me",
  });
}

export default async function ContactPage() {
  const profile = await getProfile();
  return (
    <PageTransition>
      <ContactExplorer profile={profile} links={findMeAlso(profile)} />
    </PageTransition>
  );
}
