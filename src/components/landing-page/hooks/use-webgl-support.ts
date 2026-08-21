"use client";

import { useEffect, useState } from "react";

function detectWebgl2Support(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2");

    if (!context) return false;

    context.getExtension("WEBGL_lose_context")?.loseContext();

    return true;
  } catch {
    return false;
  }
}

function useWebglSupport(): boolean | null {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setIsSupported(detectWebgl2Support());
  }, []);

  return isSupported;
}

export { useWebglSupport };
