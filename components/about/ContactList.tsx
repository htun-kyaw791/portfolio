import { IoMail } from "react-icons/io5";
import { FaMapMarkerAlt, FaPhone } from "react-icons/fa";
import type { Profile } from "@/types";

export default function ContactList({ profile: site }: { profile: Profile }) {
  return (
    <ul className="space-y-2 text-sm">
      <li>
        <a href={`mailto:${site.email}`} className="flex items-center gap-2 break-all hover:text-white">
          <IoMail className="shrink-0" /> {site.email}
        </a>
      </li>
      {site.phone && (
        <li>
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-white">
            <FaPhone className="shrink-0" /> {site.phone}
          </a>
        </li>
      )}
      {site.location && (
        <li className="flex items-center gap-2">
          <FaMapMarkerAlt className="shrink-0" /> {site.location}
        </li>
      )}
    </ul>
  );
}
