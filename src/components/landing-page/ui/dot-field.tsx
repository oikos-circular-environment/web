"use client";

import { Droplets, Leaf, Recycle, Sprout } from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";

import { cn } from "@/libs/utils";

const DOT_SPACING = 15;
const DOT_RADIUS = 1.15;
const GLOW_DOT_RADIUS = 2.1;
const CURSOR_RADIUS = 150;

const ICON_POOL = [Recycle, Leaf, Sprout, Droplets];
const ICON_SLOTS = 5;
const ICON_HOLD_MIN_MS = 4200;
const ICON_HOLD_MAX_MS = 7600;
const ICON_GAP_MIN_MS = 500;
const ICON_GAP_MAX_MS = 2200;

const FIELD_MASK =
  "linear-gradient(to bottom, transparent, black 160px, black calc(100% - 160px), transparent)";
const CURSOR_MASK =
  "radial-gradient(circle var(--cursor-radius) at var(--cursor-x) var(--cursor-y), black 0%, transparent 100%)";

type FloatingIcon = {
  id: number;
  topPercent: number;
  leftPercent: number;
  Icon: (typeof ICON_POOL)[number];
};

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function SparkleIcon({ topPercent, leftPercent, Icon }: FloatingIcon) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 20);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <Icon
      className={cn(
        "pointer-events-auto absolute size-4 -translate-x-1/2 -translate-y-1/2 text-primary/35 transition-all duration-[900ms] ease-out hover:scale-150 hover:text-primary/70 hover:duration-300",
        visible ? "scale-100 opacity-100" : "scale-50 opacity-0",
      )}
      strokeWidth={1.75}
      style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
    />
  );
}

function DotField() {
  const glowRef = useRef<HTMLDivElement>(null);
  const [icons, setIcons] = useState<FloatingIcon[]>([]);
  const nextIconId = useRef(0);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    let frame = 0;
    let pending: { x: number; y: number } | null = null;

    function scheduleUpdate() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!pending || !glow) return;
        const rect = glow.getBoundingClientRect();
        glow.style.setProperty("--cursor-x", `${pending.x - rect.left}px`);
        glow.style.setProperty("--cursor-y", `${pending.y - rect.top}px`);
        glow.style.opacity = "1";
      });
    }

    function handlePointerMove(event: PointerEvent) {
      pending = { x: event.clientX, y: event.clientY };
      scheduleUpdate();
    }

    function handlePointerLeave() {
      if (glow) glow.style.opacity = "0";
    }

    window.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerleave", handlePointerLeave);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    let disposed = false;
    const timers: number[] = [];

    function spawn() {
      if (disposed) return;
      const id = nextIconId.current++;
      const Icon = ICON_POOL[Math.floor(Math.random() * ICON_POOL.length)];
      if (!Icon) return;

      setIcons((current) => [
        ...current,
        {
          id,
          Icon,
          topPercent: randomBetween(8, 92),
          leftPercent: randomBetween(6, 94),
        },
      ]);

      const holdTimer = window.setTimeout(
        () => {
          setIcons((current) => current.filter((icon) => icon.id !== id));
          const gapTimer = window.setTimeout(
            spawn,
            randomBetween(ICON_GAP_MIN_MS, ICON_GAP_MAX_MS),
          );
          timers.push(gapTimer);
        },
        randomBetween(ICON_HOLD_MIN_MS, ICON_HOLD_MAX_MS),
      );
      timers.push(holdTimer);
    }

    for (let slot = 0; slot < ICON_SLOTS; slot++) {
      const startTimer = window.setTimeout(
        spawn,
        randomBetween(0, ICON_HOLD_MAX_MS),
      );
      timers.push(startTimer);
    }

    return () => {
      disposed = true;
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      style={{ maskImage: FIELD_MASK, WebkitMaskImage: FIELD_MASK }}
    >
      <div
        className="absolute inset-0 text-border"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor ${DOT_RADIUS}px, transparent ${DOT_RADIUS}px)`,
          backgroundSize: `${DOT_SPACING}px ${DOT_SPACING}px`,
        }}
      />

      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-500 ease-out"
        ref={glowRef}
        style={
          {
            "--cursor-radius": `${CURSOR_RADIUS}px`,
            "--cursor-x": "50%",
            "--cursor-y": "50%",
            backgroundImage: `radial-gradient(circle, var(--color-landing-terracotta) ${GLOW_DOT_RADIUS}px, transparent ${GLOW_DOT_RADIUS}px)`,
            backgroundSize: `${DOT_SPACING}px ${DOT_SPACING}px`,
            maskImage: CURSOR_MASK,
            WebkitMaskImage: CURSOR_MASK,
          } as CSSProperties
        }
      />

      {icons.map((icon) => (
        <SparkleIcon {...icon} key={icon.id} />
      ))}
    </div>
  );
}

export { DotField };
