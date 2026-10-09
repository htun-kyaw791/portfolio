import Link from "next/link";
import BlackHoleBackdrop from "@/components/blackhole/BlackHoleBackdrop";

export default function NotFoundMessage() {
  return (
    <section className="relative flex flex-1 flex-col items-center justify-end overflow-hidden pb-[8vh] text-center">
      <BlackHoleBackdrop interactive center={[0, 0.1]} className="absolute inset-0 size-full" />
      <div className="relative z-10 flex flex-col items-center gap-3 rounded-lg bg-bg-deep/50 px-6 py-4 backdrop-blur-sm">
        <p className="animate-[drift_9s_ease-in-out_infinite] text-6xl text-text-light">404</p>
        <p>{"// this route fell past the event horizon"}</p>
        <p className="text-xs">{"// nothing escapes. except you:"}</p>
        <Link href="/" className="text-accent-orange hover:underline">
          &gt; escape to _hello
        </Link>
      </div>
    </section>
  );
}
