import Link from "next/link";
import { IoClose } from "react-icons/io5";

const closeClass = "rounded p-0.5 text-base transition-colors hover:bg-btn hover:text-white";

/**
 * Editor-style tab strip with a single open tab. The × only renders when it
 * does something: `closeHref` navigates, `onClose` runs a callback.
 */
export default function TabBar({
  label,
  closeHref,
  onClose,
  closeLabel = "Close tab",
}: {
  label: string;
  closeHref?: string;
  onClose?: () => void;
  closeLabel?: string;
}) {
  return (
    <div className="hidden h-10 shrink-0 border-b border-line md:flex">
      <div className="flex items-center gap-12 border-r border-line px-4 text-sm">
        {label}
        {closeHref ? (
          <Link href={closeHref} aria-label={closeLabel} title={closeLabel} className={closeClass}>
            <IoClose />
          </Link>
        ) : onClose ? (
          <button type="button" onClick={onClose} aria-label={closeLabel} title={closeLabel} className={closeClass}>
            <IoClose />
          </button>
        ) : null}
      </div>
    </div>
  );
}
