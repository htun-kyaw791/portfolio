import type { About, Experience, InfoFolder, Profile } from "@/types";

export type AboutSection = "professional-info" | "personal-info" | "hobbies";

/** Folder trees for the about-me explorer, one per activity-bar section. */
export function buildAboutSections(
  site: Profile,
  { bio, principles, domainKnowledge, education, certifications, hobbies }: About,
  experiences: Experience[],
): Record<AboutSection, InfoFolder[]> {
  const sections: Record<AboutSection, InfoFolder[]> = {
    "professional-info": [
      {
        id: "experience",
        label: "experience",
        color: "var(--color-accent-coral)",
        files: experiences.map((e) => ({
          id: e.id,
          label: e.id,
          techs: e.techs,
          lines: [
            `${e.role} @ ${e.company}`,
            [e.period, e.url].filter(Boolean).join(" · "),
            "",
            ...e.highlights.map((h) => `- ${h}`),
          ],
        })),
      },
      {
        id: "domain-knowledge",
        label: "domain-knowledge",
        color: "var(--color-accent-green)",
        files: [
          {
            id: "domains",
            label: "domains",
            lines: domainKnowledge.flatMap((d, i) => [
              ...(i ? [""] : []),
              d.title,
              d.description,
            ]),
          },
        ],
      },
      {
        id: "principles",
        label: "principles",
        color: "var(--color-accent-indigo)",
        files: [
          {
            id: "principles",
            label: "principles",
            lines: ["What I focus on", "", ...principles.map((p) => `- ${p}`)],
          },
        ],
      },
    ],
    "personal-info": [
      {
        id: "bio",
        label: "bio",
        color: "var(--color-accent-coral)",
        files: [
          {
            id: "bio",
            label: "bio",
            lines: [
              `${site.name} — ${site.role}`,
              site.location,
              "",
              ...bio.flatMap((p, i) => (i ? ["", p] : [p])),
            ],
          },
        ],
      },
      {
        id: "education",
        label: "education",
        color: "var(--color-accent-green)",
        files: education.map((e) => ({
          id: e.id,
          label: e.id,
          lines: [e.title, [e.institution, e.period].filter(Boolean).join(" · "), "", e.description],
        })),
      },
      {
        id: "certifications",
        label: "certifications",
        color: "var(--color-accent-indigo)",
        files: [
          {
            id: "certifications",
            label: "certifications",
            lines: certifications.flatMap((c, i) => [
              ...(i ? [""] : []),
              `${c.title} — ${c.issuer} (${[c.date, c.status].filter(Boolean).join(", ")})`,
              `  ${c.skills.join(" · ")}`,
            ]),
          },
        ],
      },
    ],
    hobbies: [
      {
        id: "hobbies",
        label: "hobbies",
        color: "var(--color-accent-orange)",
        files: [
          {
            id: "hobbies",
            label: "hobbies",
            lines: ["When I'm away from work", "", ...hobbies.map((h) => `${h.emoji}  ${h.title}`)],
          },
        ],
      },
    ],
  };

  // A list emptied in the CMS (e.g. no education) would leave a folder with nothing to open.
  // Every section keeps at least one single-file folder (domains, bio, hobbies).
  return Object.fromEntries(
    Object.entries(sections).map(([id, folders]) => [id, folders.filter((f) => f.files.length > 0)]),
  ) as Record<AboutSection, InfoFolder[]>;
}
