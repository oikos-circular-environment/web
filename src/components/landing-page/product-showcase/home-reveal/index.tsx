"use client";

import { type RefObject, useRef } from "react";

import { useScrollSync } from "@/components/landing-page/hooks/use-scroll-sync";
import { cn } from "@/libs/utils";

import { type DemoStep, useDemoPuppet } from "../hooks/use-demo-puppet";
import { HomeScreen, HomeScreenAuthenticated } from "../screens/home";
import { SimulatedCursor } from "../ui/simulated-cursor";

const REVEAL_AT = 0.55;

const SCRIPT: DemoStep[] = [
  {
    at: 0.4,
    action: "click",
    selector: '[data-demo-target="session-cta"]',
  },
];

function HomeReveal({ trackRef }: { trackRef: RefObject<HTMLElement | null> }) {
  const progress = useScrollSync(trackRef);
  const sessionProgress = Math.min(progress / REVEAL_AT, 1);
  const revealed = sessionProgress >= 1;
  const containerRef = useRef<HTMLDivElement>(null);
  const cursor = useDemoPuppet(containerRef, progress, SCRIPT);

  return (
    <div className="relative size-full overflow-hidden" ref={containerRef}>
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          revealed ? "opacity-0" : "opacity-100",
        )}
      >
        <HomeScreen sessionProgress={sessionProgress} />
      </div>

      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          revealed ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <HomeScreenAuthenticated />
      </div>

      <SimulatedCursor state={cursor} />
    </div>
  );
}

export { HomeReveal };
