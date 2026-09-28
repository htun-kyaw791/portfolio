import { ImageResponse } from "next/og";
import { BrandIcon } from "@/lib/brand-icon";
import { ogFonts } from "@/lib/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  return new ImageResponse(<BrandIcon size={size.width} />, { ...size, fonts: await ogFonts() });
}
