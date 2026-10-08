import { socialLinks } from "@/lib/content";
import type { Profile } from "@/types";
import SocialIcon from "@/components/ui/SocialIcon";

export default function Footer({ profile }: { profile: Profile }) {
  return (
    <footer className="flex h-12 shrink-0 border-t border-line text-sm">
      <span className="flex items-center border-r border-line px-6">find me in:</span>
      {socialLinks(profile).map((s) => (
        <a
          key={s.name}
          href={s.href}
          target="_blank"
          rel="noreferrer"
          aria-label={s.name}
          className="flex w-14 items-center justify-center border-r border-line text-lg transition-colors hover:text-white"
        >
          <SocialIcon icon={s.icon} />
        </a>
      ))}
      {profile.resume && (
        <a
          href={profile.resume}
          target="_blank"
          rel="noreferrer"
          className="ml-auto flex items-center gap-2 border-l border-line px-6 transition-colors hover:text-white"
        >
          <span className="hidden sm:inline">resume.pdf</span>
          <SocialIcon icon="resume" className="text-base" />
        </a>
      )}
    </footer>
  );
}
