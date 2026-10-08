import { ImageResponse } from "next/og";
import { getProfile, siteUrl } from "@/lib/content";
import { OgFrame, ogColors as c, ogFonts, ogPhoto, ogSize } from "@/lib/og";

export const alt = "Portfolio share image";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  const site = await getProfile();
  const [fonts, photo] = await Promise.all([ogFonts(), ogPhoto(site.photo)]);

  return new ImageResponse(
    (
      <OgFrame tab="_hello">
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 760 }}>
            <div style={{ fontSize: 28, color: c.light }}>Hi all. I am</div>
            <div style={{ fontSize: 84, color: c.light, marginTop: 4 }}>{site.name}</div>
            <div style={{ fontSize: 40, color: c.indigo, marginTop: 4 }}>{`> ${site.role}`}</div>
            <div style={{ display: "flex", gap: 32, marginTop: 44 }}>
              {site.stats.map((s) => (
                <div key={s.label} style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 36, color: c.orange, fontWeight: 600 }}>{s.value}</div>
                  <div style={{ fontSize: 16, color: c.text }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", fontSize: 22, marginTop: 44 }}>
              <span style={{ color: c.indigo }}>const</span>
              <span style={{ color: c.green, marginLeft: 14 }}>site</span>
              <span style={{ color: "white", marginLeft: 14 }}>=</span>
              <span style={{ color: c.coral, marginLeft: 14 }}>{`"${siteUrl.replace(/^https?:\/\//, "")}"`}</span>
            </div>
          </div>
          {photo && (
            <img
              src={photo}
              alt=""
              width={250}
              height={250}
              style={{ flexShrink: 0, borderRadius: 32, border: `2px solid ${c.line}`, objectFit: "cover" }}
            />
          )}
        </div>
      </OgFrame>
    ),
    { ...size, fonts },
  );
}
