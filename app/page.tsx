"use client";

import dynamic from "next/dynamic";

// WebGL + WASM тул зөвхөн browser дээр ачаална
const Scene = dynamic(() => import("@/components/Scene"), { ssr: false });

export default function Page() {
  return <Scene />;
}
