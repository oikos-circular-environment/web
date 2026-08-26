"use client";

import { onScroll, type ScrollObserverParams } from "animejs";
import { type RefObject, useEffect, useRef, useState } from "react";

type UseScrollSyncOptions = Omit<ScrollObserverParams, "target" | "onUpdate">;

function useScrollSync(
  target: RefObject<HTMLElement | null>,
  options?: UseScrollSyncOptions,
) {
  const [progress, setProgress] = useState(0);
  const observerRef = useRef<ReturnType<typeof onScroll> | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (!target.current) return;

    const observer = onScroll({
      sync: true,
      ...optionsRef.current,
      target: target.current,
      onUpdate: (self) => setProgress(self.progress),
    });

    observerRef.current = observer;

    return () => {
      observer.revert();
      observerRef.current = null;
    };
  }, [target]);

  return progress;
}

export type { UseScrollSyncOptions };
export { useScrollSync };
