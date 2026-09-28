import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/data/site";
import ContactExplorer from "@/components/contact/ContactExplorer";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: `Get in touch with ${site.name}, ${site.role} in ${site.location} — email, phone, GitHub and LinkedIn.`,
  path: "/contact-me",
});

export default function ContactPage() {
  return <ContactExplorer />;
}
