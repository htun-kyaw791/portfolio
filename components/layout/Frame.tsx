import { getProfile, getProjects } from "@/lib/content";
import { getTerminalData } from "@/lib/terminal-data";
import CommandPalette from "@/components/chrome/CommandPalette";
import PrefsSync from "@/components/chrome/PrefsSync";
import StatusBar from "@/components/chrome/StatusBar";
import Toaster from "@/components/chrome/Toaster";
import CollapseTrigger from "@/components/blackhole/CollapseTrigger";
import IntroTrigger from "@/components/blackhole/IntroTrigger";
import TerminalDrawer from "@/components/terminal/TerminalDrawer";
import Header from "./Header";
import Footer from "./Footer";

export default async function Frame({ children }: { children: React.ReactNode }) {
  const [profile, projects, terminalData] = await Promise.all([getProfile(), getProjects(), getTerminalData()]);
  return (
    <div className="h-dvh p-0 md:p-4 lg:p-8">
      <PrefsSync />
      <div data-frame className="flex h-full flex-col overflow-hidden border-line bg-bg md:rounded-lg md:border">
        <Header handle={profile.handle} />
        <main className="flex min-h-0 flex-1">{children}</main>
        <TerminalDrawer data={terminalData} />
        <Footer profile={profile} />
        <StatusBar repoHref={profile.github} availability={profile.availability} />
      </div>
      <CommandPalette
        projects={projects.map(({ slug, name, description }) => ({ slug, name, description }))}
        links={{ email: profile.email, resume: profile.resume, github: profile.github, linkedin: profile.linkedin }}
      />
      <Toaster />
      <CollapseTrigger />
      <IntroTrigger />
    </div>
  );
}
