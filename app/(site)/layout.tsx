import Frame from "@/components/layout/Frame";
import JsonLd from "@/components/seo/JsonLd";
import "../globals.css";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd />
      <Frame>{children}</Frame>
    </>
  );
}
