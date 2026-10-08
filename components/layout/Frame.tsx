import { getProfile } from "@/lib/content";
import Header from "./Header";
import Footer from "./Footer";

export default async function Frame({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  return (
    <div className="h-dvh p-0 md:p-4 lg:p-8">
      <div className="flex h-full flex-col overflow-hidden border-line bg-bg md:rounded-lg md:border">
        <Header handle={profile.handle} />
        <main className="flex min-h-0 flex-1">{children}</main>
        <Footer profile={profile} />
      </div>
    </div>
  );
}
