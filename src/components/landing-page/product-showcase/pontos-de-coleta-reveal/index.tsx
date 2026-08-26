"use client";

import { type RefObject, useRef } from "react";

import { useScrollSync } from "@/components/landing-page/hooks/use-scroll-sync";

import { type DemoStep, useDemoPuppet } from "../hooks/use-demo-puppet";
import { MarketListScreen } from "../screens/pontos-de-coleta";
import { SimulatedCursor } from "../ui/simulated-cursor";

const SCRIPT: DemoStep[] = [
  {
    at: 0.2,
    action: "type",
    selector: '[data-demo-target="market-search"]',
    value: "oleo",
  },
  {
    at: 0.35,
    action: "click",
    selector: '[data-demo-target="market-filter-chip"]',
  },
  {
    at: 0.5,
    action: "click",
    selector: '[data-demo-target="company-card-0"]',
  },
  {
    at: 0.7,
    action: "click",
    selector: '[data-demo-target="catalog-item-0"]',
  },
];

function PontosDeColetaReveal({
  trackRef,
}: {
  trackRef: RefObject<HTMLElement | null>;
}) {
  const progress = useScrollSync(trackRef);
  const containerRef = useRef<HTMLDivElement>(null);
  const cursor = useDemoPuppet(containerRef, progress, SCRIPT);

  return (
    <div className="relative size-full overflow-hidden" ref={containerRef}>
      <MarketListScreen />
      <SimulatedCursor state={cursor} />
    </div>
  );
}

export { PontosDeColetaReveal };
