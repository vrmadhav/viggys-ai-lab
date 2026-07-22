"use client";

import { usePathname } from "next/navigation";
import { AmbientBg } from "@/components/lab/AmbientBg";

const routesWithoutAmbientBg = new Set([
  "/apps/world-cup-bracket",
  "/apps/creative-direction-studio",
]);

export function AppChrome() {
  const pathname = usePathname();

  if (routesWithoutAmbientBg.has(pathname)) return null;

  return <AmbientBg />;
}
