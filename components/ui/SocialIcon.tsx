import { FaFileAlt, FaGithub, FaGitlab, FaLinkedinIn, FaPhone } from "react-icons/fa";
import { IoMail } from "react-icons/io5";
import type { SocialLink } from "@/types";

const icons = {
  github: FaGithub,
  linkedin: FaLinkedinIn,
  gitlab: FaGitlab,
  mail: IoMail,
  phone: FaPhone,
  resume: FaFileAlt,
} satisfies Record<SocialLink["icon"], unknown>;

export default function SocialIcon({ icon, className }: { icon: SocialLink["icon"]; className?: string }) {
  const Icon = icons[icon];
  return <Icon className={className} />;
}
