import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { colors } from "./colors";

// Shared bits for the generated Open Graph images (ImageResponse needs TTF, not woff2).
export const ogSize = { width: 1200, height: 630 };

export const ogColors = colors;

const dir = join(process.cwd(), "assets/og");

export async function ogFonts() {
  const [regular, semibold] = await Promise.all([
    readFile(join(dir, "FiraCode-400.ttf")),
    readFile(join(dir, "FiraCode-600.ttf")),
  ]);
  return [
    { name: "Fira Code", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Fira Code", data: semibold, weight: 600 as const, style: "normal" as const },
  ];
}

/** The profile photo (a /public path, set in the CMS) as a data URL; ImageResponse reads JPG and PNG only. */
export async function ogPhoto(publicPath: string) {
  const type = { ".jpg": "jpeg", ".jpeg": "jpeg", ".png": "png" }[extname(publicPath).toLowerCase()];
  if (!type) return null;
  const data = await readFile(join(process.cwd(), "public", publicPath));
  return `data:image/${type};base64,${data.toString("base64")}`;
}

/** Editor-window frame used by every OG image. */
export function OgFrame({ tab, children }: { tab: string; children: React.ReactNode }) {
  const c = ogColors;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        padding: 32,
        background: c.deep,
        fontFamily: "Fira Code",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: c.bg,
          border: `2px solid ${c.line}`,
          borderRadius: 16,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* glow */}
        <div
          style={{
            position: "absolute",
            right: -120,
            top: -120,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(67,217,173,0.35), rgba(1,22,39,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 160,
            bottom: -220,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(77,91,206,0.4), rgba(1,22,39,0) 70%)",
          }}
        />
        {/* tab bar */}
        <div style={{ display: "flex", height: 64, borderBottom: `2px solid ${c.line}`, fontSize: 24, color: c.text }}>
          <div style={{ display: "flex", alignItems: "center", padding: "0 32px", borderRight: `2px solid ${c.line}` }}>
            htun-kyaw
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0 32px",
              color: "white",
              borderRight: `2px solid ${c.line}`,
              borderBottom: `4px solid ${c.orange}`,
            }}
          >
            {tab}
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", padding: "48px 64px" }}>{children}</div>
      </div>
    </div>
  );
}
