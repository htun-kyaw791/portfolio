import { experiences, education } from "@/data/experience";
import { site } from "@/data/site";

/** schema.org Person data so search engines can build a knowledge card. */
export default function JsonLd() {
  const current = experiences[0];
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    url: site.url,
    image: `${site.url}${site.photo}`,
    jobTitle: site.role,
    description: site.summary,
    email: `mailto:${site.email}`,
    address: { "@type": "PostalAddress", addressLocality: "Yangon", addressCountry: "MM" },
    worksFor: { "@type": "Organization", name: current.company, url: current.url },
    alumniOf: education.map((e) => ({ "@type": "EducationalOrganization", name: e.institution, url: e.url })),
    sameAs: [site.github, site.linkedin],
    knowsAbout: ["Laravel", "Vue.js", "React", "Next.js", "Node.js", "Odoo", "Domain-Driven Design", "Redis", "MySQL", "PostgreSQL"],
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here; escape "<" so data can't close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
