"use client";

import Image from "next/image";
import { type ComponentType, useEffect, useRef, useState } from "react";

import { useWebglSupport } from "@/components/landing-page/hooks/use-webgl-support";
import { cn } from "@/libs/utils";
import type { RippleRevealProps } from "./types";

function RippleFallback({ pristineSrc, alt, className }: RippleRevealProps) {
  return (
    <div
      data-slot="ripple-reveal-fallback"
      className={cn("relative size-full", className)}
    >
      <Image
        src={pristineSrc}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
    </div>
  );
}

function HeroRippleReveal(props: RippleRevealProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const webglSupported = useWebglSupport();
  const [Canvas, setCanvas] = useState<ComponentType<RippleRevealProps> | null>(
    null,
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host || webglSupported !== true) return;

    const interactive = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    if (!interactive) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return;

    let cancelled = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();
        void import("./ripple-reveal-canvas").then((mod) => {
          if (!cancelled) setCanvas(() => mod.RippleRevealCanvas);
        });
      },
      { rootMargin: "200px" },
    );
    observer.observe(host);

    const onMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) setCanvas(null);
    };
    motionQuery.addEventListener("change", onMotionChange);

    return () => {
      cancelled = true;
      observer.disconnect();
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, [webglSupported]);

  return (
    <div
      ref={hostRef}
      data-slot="hero-ripple-reveal"
      className="relative size-full"
    >
      {Canvas ? <Canvas {...props} /> : <RippleFallback {...props} />}
    </div>
  );
}

export type { RippleRevealProps } from "./types";
export { HeroRippleReveal };
