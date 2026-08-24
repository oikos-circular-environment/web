"use client";

import Image from "next/image";
import {
  type ComponentType,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";

import { useScrollSync } from "@/components/landing-page/hooks/use-scroll-sync";
import { useWebglSupport } from "@/components/landing-page/hooks/use-webgl-support";
import { cn } from "@/libs/utils";

import { HomeScreen } from "../screens/home";

const ISLAND_FADE_AT = 0.5;

function CloudReveal({
  trackRef,
}: {
  trackRef: RefObject<HTMLElement | null>;
}) {
  const progress = useScrollSync(trackRef);
  const hostRef = useRef<HTMLDivElement>(null);
  const webglSupported = useWebglSupport();
  const [Canvas, setCanvas] = useState<ComponentType<{
    progress: number;
  }> | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionQuery.matches);

    const onChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };
    motionQuery.addEventListener("change", onChange);
    return () => motionQuery.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || webglSupported !== true || reducedMotion) return;

    let cancelled = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();
        void import("./cloud-reveal-canvas").then((mod) => {
          if (!cancelled) setCanvas(() => mod.CloudRevealCanvas);
        });
      },
      { rootMargin: "200px" },
    );
    observer.observe(host);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [webglSupported, reducedMotion]);

  const islandOpacity = Math.max(
    0,
    Math.min(1, 1 - (progress - ISLAND_FADE_AT) / (1 - ISLAND_FADE_AT)),
  );

  return (
    <div className="relative size-full overflow-hidden bg-white" ref={hostRef}>
      <HomeScreen />

      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-200",
          islandOpacity <= 0 && "pointer-events-none",
        )}
        style={{ opacity: islandOpacity }}
      >
        <Image
          alt=""
          className="object-contain object-bottom"
          fill
          priority
          unoptimized
          src="/product-showcase/cloud-reveal/island.png"
        />
      </div>

      {Canvas ? <Canvas progress={progress} /> : null}
    </div>
  );
}

export { CloudReveal };
