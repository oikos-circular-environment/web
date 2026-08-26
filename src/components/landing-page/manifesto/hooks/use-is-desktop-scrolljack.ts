"use client";

import { useEffect, useState } from "react";

function useIsDesktopScrollJack(): boolean | null {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 768px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => {
      setIsDesktop(desktopQuery.matches && !motionQuery.matches);
    };

    update();
    desktopQuery.addEventListener("change", update);
    motionQuery.addEventListener("change", update);

    return () => {
      desktopQuery.removeEventListener("change", update);
      motionQuery.removeEventListener("change", update);
    };
  }, []);

  return isDesktop;
}

export { useIsDesktopScrollJack };
