import CodeBlock from "@/components/ui/CodeBlock";
import type { ContactValues } from "./ContactForm";

const K = ({ children }: { children: React.ReactNode }) => <span className="text-accent-purple">{children}</span>;
const V = ({ children }: { children: React.ReactNode }) => <span className="text-accent-indigo">{children}</span>;
const F = ({ children }: { children: React.ReactNode }) => <span className="text-accent-indigo">{children}</span>;
const S = (props: React.ComponentProps<"span">) => <span className="text-accent-coral" {...props} />;

/** Live JS preview of the contact form values. */
export default function CodePreview({ values }: { values: ContactValues }) {
  const date = new Date().toDateString().slice(4); // e.g. "Sep 28 2026"

  const lines = [
    <>
      <K>const</K> <V>button</V> <K>=</K> <V>document</V>.<F>querySelector</F>(<S>&apos;#sendBtn&apos;</S>);
    </>,
    "",
    <>
      <K>const</K> <V>message</V> <K>=</K> {"{"}
    </>,
    <>
      {"  "}
      <V>name</V>: <S>&quot;{values.name}&quot;</S>,
    </>,
    <>
      {"  "}
      <V>email</V>: <S>&quot;{values.email}&quot;</S>,
    </>,
    <>
      {"  "}
      <V>message</V>: <S>&quot;{values.message}&quot;</S>,
    </>,
    <>
      {"  "}
      <V>date</V>: <S suppressHydrationWarning>&quot;{date}&quot;</S>
    </>,
    "}",
    "",
    <>
      <V>button</V>.<F>addEventListener</F>(<S>&apos;click&apos;</S>, () <K>=&gt;</K> {"{"}
    </>,
    <>
      {"  "}
      <V>form</V>.<F>send</F>(<V>message</V>);
    </>,
    "})",
  ];

  return <CodeBlock lines={lines} className="text-text" />;
}
