import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <p className="text-6xl text-text-light">404</p>
      <p>{"// page not found"}</p>
      <Link href="/" className="text-accent-orange hover:underline">
        &gt; go back to _hello
      </Link>
    </section>
  );
}
