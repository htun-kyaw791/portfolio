import { ImageResponse } from "next/og";
import { getProfile, getProject, getProjects } from "@/lib/content";
import { OgFrame, ogColors as c, ogFonts, ogSize } from "@/lib/og";

export const alt = "Project share image";
export const size = ogSize;
export const contentType = "image/png";

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const [project, site, fonts] = await Promise.all([getProject((await params).slug), getProfile(), ogFonts()]);
  const name = project?.name ?? "Project";
  const description = project?.description ?? "";

  return new ImageResponse(
    (
      <OgFrame tab={`${project?.slug ?? "project"}.tsx`}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 24, color: c.text }}>
            {`// ${project ? `${project.type.join(" · ")} · ${project.date}` : "project"}`}
          </div>
          <div style={{ fontSize: 68, color: c.light, marginTop: 12, lineHeight: 1.15 }}>{name}</div>
          {project?.role && <div style={{ fontSize: 30, color: c.indigo, marginTop: 12 }}>{`> ${project.role}`}</div>}
          <div style={{ fontSize: 24, color: c.text, marginTop: 28, lineHeight: 1.5, maxWidth: 960 }}>
            {description.length > 180 ? `${description.slice(0, 177)}…` : description}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: "auto" }}>
            {project?.technos.slice(0, 6).map((t) => (
              <div
                key={t}
                style={{ fontSize: 22, color: c.coral, border: `2px solid ${c.line}`, borderRadius: 10, padding: "6px 16px" }}
              >
                {t}
              </div>
            ))}
            <div style={{ fontSize: 22, color: c.orange, marginLeft: "auto", padding: "6px 0" }}>{site.name}</div>
          </div>
        </div>
      </OgFrame>
    ),
    { ...size, fonts },
  );
}
