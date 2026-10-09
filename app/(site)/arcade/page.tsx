import type { Metadata } from "next";
import { getTechnos } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import Arcade from "@/components/arcade/Arcade";
import HighScores from "@/components/arcade/HighScores";
import { games } from "@/components/arcade/games";
import Sidebar from "@/components/ui/Sidebar";
import SidebarSection from "@/components/ui/SidebarSection";
import TabBar from "@/components/ui/TabBar";
import PageTransition from "@/components/layout/PageTransition";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Arcade",
    description: "Small browser games built into the portfolio: Snake, a breakout made of my tech stack, a typing test with real code, Bug Invaders and Event Horizon.",
    path: "/arcade",
  });
}

export default async function ArcadePage() {
  const technos = (await getTechnos()).map(({ title, type }) => ({ title, type }));
  return (
    <PageTransition>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
        <h1 className="px-6 py-6 text-white md:sr-only">_arcade</h1>

        <Sidebar className="md:w-[311px]">
          <SidebarSection title="games">
            <ul className="space-y-3 text-sm">
              {games.map((g) => (
                <li key={g.id}>
                  {/* plain anchors: the hash change switches the console tab */}
                  <a href={`#${g.id}`} className="text-text-light hover:text-white">
                    {g.file}
                  </a>
                  <p className="text-xs">{`// ${g.blurb}`}</p>
                </li>
              ))}
            </ul>
          </SidebarSection>
          <SidebarSection title="high-scores">
            <HighScores />
          </SidebarSection>
          <SidebarSection title="controls">
            <ul className="space-y-1 text-xs">
              <li>{"// enter: start"}</li>
              <li>{"// p: pause"}</li>
              <li>{"// arrows: move"}</li>
              <li>{"// ← → on tabs: switch game"}</li>
            </ul>
          </SidebarSection>
        </Sidebar>

        <section className="flex min-w-0 flex-1 flex-col">
          <TabBar label="arcade" />
          <div className="flex flex-1 items-start justify-center px-4 py-8 md:items-center md:overflow-y-auto">
            <Arcade technos={technos} variant="page" />
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
