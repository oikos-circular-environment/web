"use client";

import { animate, cubicBezier, stagger } from "animejs";
import type * as React from "react";
import { useRef } from "react";

import { useAnimeScope } from "@/components/landing-page/hooks/use-anime-scope";

const HERO_RISE_SELECTOR = ".hero-rise";

function HeroEntrance({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useAnimeScope(root, (scope) => {
    const reducedMotion = scope.matches.reducedMotion;

    animate(HERO_RISE_SELECTOR, {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: reducedMotion ? 0 : 1000,
      ease: cubicBezier(0.44, 0, 0.56, 1),
      delay: reducedMotion ? 0 : stagger(120),
    });
  });

  return (
    <div ref={root} className="contents">
      {children}
    </div>
  );
}

export { HeroEntrance };
