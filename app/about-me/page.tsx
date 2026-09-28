import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/data/site";
import AboutExplorer from "@/components/about/AboutExplorer";

export const metadata: Metadata = pageMetadata({
  title: "About me",
  description: `${site.role} with 5 years building enterprise web apps: experience at UMG Myanmar and Panacea Soft, education, certifications and tech stack.`,
  path: "/about-me",
});

export default function AboutPage() {
  return <AboutExplorer />;
}
