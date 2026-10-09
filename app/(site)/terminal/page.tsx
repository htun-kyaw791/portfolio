import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { getTerminalData } from "@/lib/terminal-data";
import Terminal from "@/components/terminal/Terminal";
import TabBar from "@/components/ui/TabBar";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Terminal",
    description: "Explore the portfolio from a command line: ls projects, cat about.md, git log, neofetch and a few hidden commands.",
    path: "/terminal",
  });
}

export default async function TerminalPage() {
  const data = await getTerminalData();
  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <h1 className="sr-only">Terminal</h1>
      <TabBar label="bash: hksh" closeHref="/" closeLabel="Close terminal" />
      <Terminal data={data} focusSignal={1} className="flex-1" />
    </section>
  );
}
