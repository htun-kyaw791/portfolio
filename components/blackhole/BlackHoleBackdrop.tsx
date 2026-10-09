"use client";

import dynamic from "next/dynamic";
import { BlackHoleFallback } from "./BlackHole";

// Code-split wrapper: the static CSS version renders on the server (and without
// JS); the WebGL canvas replaces it once loaded.
const BlackHole = dynamic(() => import("./BlackHole"), {
  ssr: false,
  loading: () => <BlackHoleFallback className="absolute inset-0" />,
});

export default function BlackHoleBackdrop(props: React.ComponentProps<typeof BlackHole>) {
  return <BlackHole {...props} />;
}

export { BlackHoleFallback };
