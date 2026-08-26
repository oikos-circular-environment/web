"use client";

import { createScope, type Scope } from "animejs";
import { type RefObject, useEffect, useRef } from "react";

type AnimeScopeSetup = (scope: Scope) => void;

function useAnimeScope(
  root: RefObject<HTMLElement | null>,
  setup: AnimeScopeSetup,
) {
  const scopeRef = useRef<Scope | null>(null);
  const setupRef = useRef(setup);
  setupRef.current = setup;

  useEffect(() => {
    const scope = createScope({
      root,
      mediaQueries: { reducedMotion: "(prefers-reduced-motion: reduce)" },
    }).add((s) => {
      if (s) setupRef.current(s);
    });

    scopeRef.current = scope;

    return () => {
      scope.revert();
      scopeRef.current = null;
    };
  }, [root]);

  return scopeRef;
}

export type { AnimeScopeSetup };
export { useAnimeScope };
