"use client";

import { useIsDesktopScrollJack } from "./hooks/use-is-desktop-scrolljack";
import { ScrollStage } from "./scroll-stage";
import { VerticalFallback } from "./vertical-fallback";

function ManifestoSwitch() {
  const isDesktop = useIsDesktopScrollJack();

  if (isDesktop) return <ScrollStage />;
  return <VerticalFallback />;
}

export { ManifestoSwitch };
