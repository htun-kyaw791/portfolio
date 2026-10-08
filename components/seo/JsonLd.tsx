import { getAbout, getExperiences, getProfile, getTechnos, siteUrl } from "@/lib/content";

/** schema.org Person data so search engines can build a knowledge card. */
export default async function JsonLd() {
  const [site, { education }, experiences, technos] = await Promise.all([
    getProfile(),
    getAbout(),
    getExperiences(),
    getTechnos(),
  ]);
  const current = experiences[0];
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    url: siteUrl,
    image: site.photo ? `${siteUrl}${site.photo}` : undefined,
    jobTitle: site.role,
    description: site.summary,
    email: `mailto:${site.email}`,
    address: site.location ? { "@type": "PostalAddress", addressLocality: site.location } : undefined,
    worksFor: current ? { "@type": "Organization", name: current.company, url: current.url || undefined } : undefined,
    alumniOf: education.map((e) => ({ "@type": "EducationalOrganization", name: e.institution, url: e.url || undefined })),
    sameAs: [site.github, site.linkedin, site.gitlab].filter(Boolean),
    // Everything on the about-me tech stack except everyday tools (Git, Postman, ...).
    knowsAbout: technos
      .filter((t) => t.type !== "development-tool")
      .map((t) => ({ "@type": "Thing", name: t.title, url: t.url })),
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here; escape "<" so data can't close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
