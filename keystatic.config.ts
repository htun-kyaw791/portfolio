import { collection, config, fields, singleton } from "@keystatic/core";
import { projectTypes, techTypes, type TechType } from "./lib/taxonomy";

// Content admin at /keystatic. Edits are saved to content/ and public/ as plain files.
//
// - Live site: GitHub mode. Sign in with GitHub; each save is a commit to the repo, and
//   Vercel redeploys. Needs the KEYSTATIC_* env vars (see README → Editing content).
// - Dev server: local mode, saving straight to the files here. Set
//   NEXT_PUBLIC_KEYSTATIC_GITHUB=1 to use GitHub mode locally (needed once, for setup).
const useGitHub = process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB === "1";

const required = { validation: { isRequired: true } } as const;

const textList = (label: string, itemLabel = "Item", description?: string) =>
  fields.array(fields.text({ label: itemLabel, multiline: true }), {
    label,
    description,
    itemLabel: (props) => props.value || itemLabel,
  });

export default config({
  storage: useGitHub ? { kind: "github", repo: "htun-kyaw791/portfolio" } : { kind: "local" },
  ui: {
    brand: { name: "Portfolio" },
    navigation: {
      Content: ["projects"],
      "About me": ["profile", "experience", "about", "techStack"],
    },
  },

  singletons: {
    profile: singleton({
      label: "Profile",
      path: "content/profile",
      format: { data: "json" },
      schema: {
        name: fields.text({ label: "Name", ...required }),
        handle: fields.text({ label: "Handle", description: "Shown top-left in the header, e.g. htun-kyaw", ...required }),
        role: fields.text({ label: "Role", ...required }),
        availability: fields.text({ label: "Availability", description: "The green badge on the home page" }),
        summary: fields.text({
          label: "Summary",
          multiline: true,
          description: "One or two sentences; also used as the site description in search results",
          ...required,
        }),
        location: fields.text({ label: "Location" }),
        email: fields.text({ label: "Email", ...required }),
        phone: fields.text({ label: "Phone" }),
        github: fields.url({ label: "GitHub URL" }),
        linkedin: fields.url({ label: "LinkedIn URL" }),
        gitlab: fields.url({ label: "GitLab URL" }),
        photo: fields.image({
          label: "Photo",
          description: "Square JPG or PNG (it is also used in the share image, which can't read WebP)",
          directory: "public/profile",
          publicPath: "/profile/",
        }),
        resume: fields.file({ label: "Resume (PDF)", directory: "public/profile", publicPath: "/profile/" }),
        stats: fields.array(
          fields.object({
            value: fields.text({ label: "Value", description: "e.g. 5+", ...required }),
            label: fields.text({ label: "Label", description: "e.g. years building", ...required }),
          }),
          { label: "Stats", itemLabel: (props) => `${props.fields.value.value} ${props.fields.label.value}` },
        ),
        keywords: fields.array(fields.text({ label: "Keyword" }), {
          label: "SEO keywords",
          itemLabel: (props) => props.value || "Keyword",
        }),
      },
    }),

    experience: singleton({
      label: "Experience",
      path: "content/experience",
      format: { data: "json" },
      schema: {
        roles: fields.array(
          fields.object({
            id: fields.text({
              label: "File name",
              description: "Short id shown in the about-me explorer, e.g. umg-myanmar",
              ...required,
            }),
            company: fields.text({ label: "Company", ...required }),
            role: fields.text({ label: "Role", ...required }),
            period: fields.text({ label: "Period", description: "e.g. Jul 2024 - Present", ...required }),
            url: fields.url({ label: "Company website" }),
            highlights: textList("Highlights", "Highlight", "The first one is shown on the timeline"),
            techs: fields.array(fields.text({ label: "Tech" }), {
              label: "Techs",
              description: "Names matching the tech stack are highlighted on the about page",
              itemLabel: (props) => props.value || "Tech",
            }),
          }),
          {
            label: "Roles",
            description: "Newest first; drag to reorder",
            itemLabel: (props) => `${props.fields.role.value} @ ${props.fields.company.value}`,
          },
        ),
      },
    }),

    about: singleton({
      label: "Bio, education & more",
      path: "content/about",
      format: { data: "json" },
      schema: {
        bio: textList("Bio", "Paragraph"),
        principles: textList("Principles", "Principle"),
        domainKnowledge: fields.array(
          fields.object({
            title: fields.text({ label: "Title", ...required }),
            description: fields.text({ label: "Description", multiline: true }),
          }),
          { label: "Domain knowledge", itemLabel: (props) => props.fields.title.value || "Domain" },
        ),
        education: fields.array(
          fields.object({
            id: fields.text({ label: "File name", description: "Short id shown in the explorer, e.g. ucsm", ...required }),
            title: fields.text({ label: "Title", ...required }),
            institution: fields.text({ label: "Institution", ...required }),
            period: fields.text({ label: "Period", description: "e.g. 2017 - 2020" }),
            url: fields.url({ label: "Website" }),
            description: fields.text({ label: "Description", multiline: true }),
          }),
          { label: "Education", itemLabel: (props) => props.fields.title.value || "Education" },
        ),
        certifications: fields.array(
          fields.object({
            title: fields.text({ label: "Title", ...required }),
            issuer: fields.text({ label: "Issuer", ...required }),
            date: fields.text({ label: "Year" }),
            status: fields.select({
              label: "Status",
              options: [
                { label: "Completed", value: "Completed" },
                { label: "In Progress", value: "In Progress" },
              ],
              defaultValue: "Completed",
            }),
            link: fields.url({ label: "Link" }),
            skills: fields.array(fields.text({ label: "Skill" }), {
              label: "Skills",
              itemLabel: (props) => props.value || "Skill",
            }),
          }),
          { label: "Certifications", itemLabel: (props) => props.fields.title.value || "Certification" },
        ),
        hobbies: fields.array(
          fields.object({
            emoji: fields.text({ label: "Emoji" }),
            title: fields.text({ label: "Hobby", ...required }),
          }),
          { label: "Hobbies", itemLabel: (props) => `${props.fields.emoji.value} ${props.fields.title.value}` },
        ),
      },
    }),

    techStack: singleton({
      label: "Tech stack",
      path: "content/tech-stack",
      format: { data: "json" },
      schema: {
        technos: fields.array(
          fields.object({
            title: fields.text({ label: "Name", ...required }),
            type: fields.select({
              label: "Group",
              options: (Object.keys(techTypes) as TechType[]).map((value) => ({ value, label: techTypes[value] })),
              defaultValue: "framework",
            }),
            url: fields.url({ label: "Website" }),
          }),
          {
            label: "Technologies",
            description: "Shown grouped on the about page, in this order within each group",
            itemLabel: (props) => `${props.fields.title.value} · ${techTypes[props.fields.type.value]}`,
          },
        ),
      },
    }),
  },

  collections: {
    projects: collection({
      label: "Projects",
      slugField: "name",
      path: "content/projects/*",
      format: { data: "json" },
      columns: ["order", "date"],
      schema: {
        name: fields.slug({
          name: { label: "Name", ...required },
          slug: { label: "URL slug", description: "The project's address: /projects/<slug>" },
        }),
        order: fields.integer({
          label: "Order",
          description: "Lower numbers are listed first. Existing projects use steps of 10 so you can slot one in between.",
          defaultValue: 100,
          ...required,
        }),
        date: fields.text({ label: "Year", ...required }),
        type: fields.multiselect({
          label: "Categories",
          description: "\"archive\" hides the project unless the archive filter is on",
          options: projectTypes.map((value) => ({ value, label: value })),
        }),
        description: fields.text({ label: "Description", multiline: true, ...required }),
        role: fields.text({ label: "My role" }),
        image: fields.image({
          label: "Screenshot",
          description: "Top of the image is kept when cropped; WebP recommended",
          directory: "public/projects",
          publicPath: "/projects/",
        }),
        link: fields.url({ label: "Live URL" }),
        repoLink: fields.url({ label: "Source code URL" }),
        technos: fields.array(fields.text({ label: "Tech" }), {
          label: "Tech used",
          description: "The first 5 are shown on the project card",
          itemLabel: (props) => props.value || "Tech",
        }),
        scale: fields.text({ label: "Scale", multiline: true, description: "Who uses it and how much, with numbers" }),
        businessImpact: fields.text({ label: "Business impact", multiline: true }),
        responsibilities: textList("Responsibilities", "Responsibility"),
        achievements: textList("Achievements", "Achievement"),
        architecture: textList("Architecture", "Point"),
      },
    }),
  },
});
