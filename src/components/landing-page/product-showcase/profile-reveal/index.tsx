"use client";

import { type RefObject, useRef } from "react";

import { useScrollSync } from "@/components/landing-page/hooks/use-scroll-sync";
import { cn } from "@/libs/utils";

import { type DemoStep, useDemoPuppet } from "../hooks/use-demo-puppet";
import { HomeScreenAuthenticated } from "../screens/home";
import { ProfileScreen } from "../screens/profile";
import { SimulatedCursor } from "../ui/simulated-cursor";

const CURSOR_CLICK_AT = 0.5;
const CROSSFADE_START = 0.65;

const SCRIPT: DemoStep[] = [
  {
    at: CURSOR_CLICK_AT,
    action: "click",
    selector: '[data-demo-target="tab-perfil"]',
  },
];

function ProfileReveal({
  trackRef,
}: {
  trackRef: RefObject<HTMLElement | null>;
}) {
  const progress = useScrollSync(trackRef);
  const showProfile = progress >= CROSSFADE_START;
  const containerRef = useRef<HTMLDivElement>(null);
  const cursor = useDemoPuppet(containerRef, progress, SCRIPT);

  return (
    <div className="relative size-full overflow-hidden" ref={containerRef}>
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          showProfile ? "pointer-events-none opacity-0" : "opacity-100",
        )}
      >
        <HomeScreenAuthenticated />
      </div>

      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          showProfile ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        style={{
          filter: showProfile && progress < 0.85 ? "blur(2px)" : undefined,
        }}
      >
        <ProfileScreen />
      </div>

      <SimulatedCursor state={cursor} />
    </div>
  );
}

export { ProfileReveal };
