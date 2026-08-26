"use client";

import { animate, cubicBezier, stagger } from "animejs";
import { useEffect, useRef } from "react";
import { StoreBadge } from "./store-badge";
import { APP_STORE_PATH_D, GOOGLE_PLAY_PATH_D } from "./store-badge-icons";

const ANDROID_URL =
  "https://play.google.com/store/apps/details?id=com.oikos&hl=pt_BR";
const IOS_URL =
  "https://apps.apple.com/br/app/oikos-economia-circular/id6786017565";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function StoreBadges() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();

        const wrappers = container.querySelectorAll<HTMLElement>(
          "[data-badge-icon-wrapper]",
        );
        const strokes = container.querySelectorAll<SVGPathElement>(
          '[data-badge-icon="stroke"]',
        );
        const fills = container.querySelectorAll<SVGPathElement>(
          '[data-badge-icon="fill"]',
        );

        if (prefersReducedMotion()) {
          for (const el of wrappers) {
            el.style.transform = "scale(1)";
          }
          for (const el of strokes) {
            el.style.opacity = "0";
          }
          for (const el of fills) {
            el.style.opacity = "1";
          }
          return;
        }

        animate(wrappers, {
          delay: stagger(250),
          duration: 600,
          ease: "outQuad",
          scale: [0.8, 1],
        });

        animate(strokes, {
          delay: stagger(250),
          duration: 1500,
          ease: cubicBezier(0.44, 0, 0.56, 1),
          strokeDashoffset: [1, 0],
        });

        animate(strokes, {
          delay: stagger(250, { start: 1200 }),
          duration: 400,
          ease: "outQuad",
          opacity: [1, 0],
        });

        animate(fills, {
          delay: stagger(250, { start: 1200 }),
          duration: 400,
          ease: "outQuad",
          opacity: [0, 1],
        });
      },
      { threshold: 0.2 },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-3"
      data-slot="store-badges"
      ref={containerRef}
    >
      <StoreBadge
        ariaLabel="Baixar o app Oikos na Google Play (abre em nova aba)"
        href={ANDROID_URL}
        iconD={GOOGLE_PLAY_PATH_D}
        storeName="Google Play"
      />
      <StoreBadge
        ariaLabel="Baixar o app Oikos na App Store (abre em nova aba)"
        href={IOS_URL}
        iconD={APP_STORE_PATH_D}
        storeName="App Store"
      />
    </div>
  );
}

export { StoreBadges };
