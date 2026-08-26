"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { MANIFESTO_BACKGROUND } from "./beats";

function ManifestoBackground() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionQuery.matches);

    const onChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };
    motionQuery.addEventListener("change", onChange);
    return () => motionQuery.removeEventListener("change", onChange);
  }, []);

  const { videoSrc, posterSrc, alt } = MANIFESTO_BACKGROUND;
  const showVideo = videoSrc && !reducedMotion && !videoFailed;

  if (showVideo) {
    return (
      <video
        aria-hidden="true"
        autoPlay
        className="absolute inset-0 size-full object-cover"
        loop
        muted
        onError={() => setVideoFailed(true)}
        playsInline
        poster={posterSrc}
        tabIndex={-1}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
    );
  }

  if (posterSrc) {
    return (
      <Image alt={alt} className="object-cover" fill priority src={posterSrc} />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-stone-900 to-neutral-800"
    />
  );
}

export { ManifestoBackground };
