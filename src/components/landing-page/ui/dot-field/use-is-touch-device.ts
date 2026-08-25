"use client";

import { useEffect, useState } from "react";

function useIsTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(hover: none)");
    setIsTouchDevice(query.matches);

    function handleChange(event: MediaQueryListEvent) {
      setIsTouchDevice(event.matches);
    }

    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return isTouchDevice;
}

export { useIsTouchDevice };
