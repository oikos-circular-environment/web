"use client";

import { type RefObject, useRef } from "react";

import { useScrollSync } from "@/components/landing-page/hooks/use-scroll-sync";
import { cn } from "@/libs/utils";

import { type DemoStep, useDemoPuppet } from "../hooks/use-demo-puppet";
import { CompanyRegistrationScreen } from "../screens/company-registration";
import { HomeScreenAuthenticated } from "../screens/home";
import { SimulatedCursor } from "../ui/simulated-cursor";

const CROSSFADE_AT = 0.25;

const SCRIPT: DemoStep[] = [
  {
    at: 0.35,
    action: "click",
    selector: '[data-demo-target="company-new-btn"]',
  },
  {
    at: 0.5,
    action: "type",
    selector: '[data-demo-target="company-name"]',
    value: "Oikos Economia Circular",
  },
  {
    at: 0.7,
    action: "click",
    selector: '[data-demo-target="company-submit"]',
  },
];

function CompanyRegistrationReveal({
  trackRef,
}: {
  trackRef: RefObject<HTMLElement | null>;
}) {
  const progress = useScrollSync(trackRef);
  const showCompany = progress >= CROSSFADE_AT;
  const containerRef = useRef<HTMLDivElement>(null);
  const cursor = useDemoPuppet(containerRef, progress, SCRIPT);

  return (
    <div className="relative size-full overflow-hidden" ref={containerRef}>
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          showCompany ? "pointer-events-none opacity-0" : "opacity-100",
        )}
      >
        <HomeScreenAuthenticated />
      </div>

      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          showCompany ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <CompanyRegistrationScreen />
      </div>

      <SimulatedCursor state={cursor} />
    </div>
  );
}

export { CompanyRegistrationReveal };
