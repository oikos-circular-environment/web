"use client";

import Image from "next/image";
import { type RefObject, useRef } from "react";

import { useScrollSync } from "@/components/landing-page/hooks/use-scroll-sync";
import { cn } from "@/libs/utils";

import { type DemoStep, useDemoPuppet } from "../hooks/use-demo-puppet";
import { ReportMapScreen } from "../screens/report-map";
import { SimulatedCursor } from "../ui/simulated-cursor";

const START_SCALE = 1.65;
const ZOOM_END = 0.15;
const MAP_START = 0.35;
const SCRIPT: DemoStep[] = [
  {
    at: 0.2,
    action: "click",
    selector: '[data-demo-target="complaint-category-chip"]',
  },
  {
    at: 0.25,
    action: "type",
    selector: '[data-demo-target="complaint-observation"]',
    value: "Descarte irregular de entulho",
  },
  {
    at: 0.3,
    action: "click",
    selector: '[data-demo-target="complaint-submit"]',
  },
  {
    at: 0.5,
    action: "click",
    selector: '[data-demo-target="create-complaint-btn"]',
  },
  {
    at: 0.55,
    action: "click",
    selector: '[data-demo-target="filter-button"]',
  },
  {
    at: 0.6,
    action: "click",
    selector: '[data-demo-target="filter-hazard-chip"]',
  },
  {
    at: 0.65,
    action: "click",
    selector: '[data-demo-target="filter-apply"]',
  },
  {
    at: 0.75,
    action: "click",
    selector: '[data-demo-target="vote-resolved"]',
  },
  {
    at: 0.85,
    action: "type",
    selector: '[data-demo-target="resolution-textarea"]',
    value: "Resolvido com coleta regular",
  },
  {
    at: 0.9,
    action: "click",
    selector: '[data-demo-target="resolution-submit"]',
  },
];

function ReportReveal({
  trackRef,
}: {
  trackRef: RefObject<HTMLElement | null>;
}) {
  const progress = useScrollSync(trackRef);
  const showPhoto = progress < ZOOM_END;
  const showForm = progress >= ZOOM_END && progress < MAP_START;
  const showMap = progress >= MAP_START;
  const settleProgress = Math.min(progress / ZOOM_END, 1);
  const scale = START_SCALE - (START_SCALE - 1) * settleProgress;
  const containerRef = useRef<HTMLDivElement>(null);
  const cursor = useDemoPuppet(containerRef, progress, SCRIPT);

  return (
    <div
      className="relative size-full overflow-hidden bg-[#1a1a1a]"
      ref={containerRef}
    >
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          showPhoto ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        style={{ transform: `scale(${scale})` }}
      >
        <Image
          alt="Descarte irregular de pneus e entulho registrado por uma denúncia"
          className="object-cover"
          fill
          sizes="360px"
          src="/device-preview/home/denuncias.jpg"
        />
      </div>

      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          showForm ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ReportMapScreen />
      </div>

      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          showMap ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ReportMapScreen />
      </div>

      <SimulatedCursor state={cursor} />
    </div>
  );
}

export { ReportReveal };
