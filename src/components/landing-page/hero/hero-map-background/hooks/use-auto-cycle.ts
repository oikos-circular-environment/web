"use client";

import { useEffect, useState } from "react";

function useAutoCycle(itemCount: number, intervalMs: number) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (itemCount <= 1) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % itemCount);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [itemCount, intervalMs]);

  return activeIndex;
}

export { useAutoCycle };
