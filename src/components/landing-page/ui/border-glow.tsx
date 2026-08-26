"use client";

import type * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/libs/utils";

interface BorderGlowProps extends React.ComponentProps<"div"> {
  edgeSensitivity?: number;
  glowColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  colors?: string[];
}

function parseHsl(hsl: string): { h: number; s: number; l: number } {
  const match = hsl.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 90, s: 60, l: 70 };
  return { h: Number(match[1]), s: Number(match[2]), l: Number(match[3]) };
}

function buildBoxShadow(glowColor: string, intensity: number): string {
  const { h, s, l } = parseHsl(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const layers: Array<[number, number, number, number, number, boolean]> = [
    [0, 0, 0, 1, 100, true],
    [0, 0, 1, 0, 60, true],
    [0, 0, 3, 0, 50, true],
    [0, 0, 6, 0, 40, true],
    [0, 0, 15, 0, 30, true],
    [0, 0, 25, 2, 20, true],
    [0, 0, 50, 2, 10, true],
    [0, 0, 1, 0, 60, false],
    [0, 0, 3, 0, 50, false],
    [0, 0, 6, 0, 40, false],
    [0, 0, 15, 0, 30, false],
    [0, 0, 25, 2, 20, false],
    [0, 0, 50, 2, 10, false],
  ];
  return layers
    .map(([x, y, blur, spread, alpha, inset]) => {
      const a = Math.min(alpha * intensity, 100);
      return `${inset ? "inset " : ""}${x}px ${y}px ${blur}px ${spread}px hsl(${base} / ${a}%)`;
    })
    .join(", ");
}

const GRADIENT_POSITIONS = [
  "80% 55%",
  "69% 34%",
  "8% 6%",
  "41% 38%",
  "86% 85%",
  "82% 18%",
  "51% 4%",
];
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

function buildMeshGradients(colors: string[]): string[] {
  return GRADIENT_POSITIONS.map((position, i) => {
    const color = colors[Math.min(COLOR_MAP[i] ?? 0, colors.length - 1)];
    return `radial-gradient(at ${position}, ${color} 0px, transparent 50%)`;
  });
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function easeInCubic(t: number) {
  return t ** 3;
}

function animateValue({
  start = 0,
  end = 100,
  duration = 1000,
  delay = 0,
  ease = easeOutCubic,
  onUpdate,
  onEnd,
}: {
  start?: number;
  end?: number;
  duration?: number;
  delay?: number;
  ease?: (t: number) => number;
  onUpdate: (value: number) => void;
  onEnd?: () => void;
}) {
  const startTime = performance.now() + delay;
  const tick = () => {
    const elapsed = performance.now() - startTime;
    const t = Math.min(elapsed / duration, 1);
    onUpdate(start + (end - start) * ease(t));
    if (t < 1) requestAnimationFrame(tick);
    else onEnd?.();
  };
  setTimeout(() => requestAnimationFrame(tick), delay);
}

function getCenter(el: HTMLElement): [number, number] {
  const { width, height } = el.getBoundingClientRect();
  return [width / 2, height / 2];
}

function getEdgeProximity(el: HTMLElement, x: number, y: number) {
  const [cx, cy] = getCenter(el);
  const dx = x - cx;
  const dy = y - cy;
  const kx = dx !== 0 ? cx / Math.abs(dx) : Number.POSITIVE_INFINITY;
  const ky = dy !== 0 ? cy / Math.abs(dy) : Number.POSITIVE_INFINITY;
  return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
}

function getCursorAngle(el: HTMLElement, x: number, y: number) {
  const [cx, cy] = getCenter(el);
  const dx = x - cx;
  const dy = y - cy;
  if (dx === 0 && dy === 0) return 0;
  const degrees = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
  return degrees < 0 ? degrees + 360 : degrees;
}

function BorderGlow({
  className,
  children,
  edgeSensitivity = 30,
  glowColor = "88 60% 68%",
  borderRadius = 999,
  glowRadius = 24,
  glowIntensity = 1,
  coneSpread = 25,
  colors = ["#84cc16", "#2e7d74", "#d4a144"],
  ...props
}: BorderGlowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [cursorAngle, setCursorAngle] = useState(45);
  const [edgeProximity, setEdgeProximity] = useState(0);
  const [sweepActive, setSweepActive] = useState(false);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setEdgeProximity(getEdgeProximity(el, x, y));
      setCursorAngle(getCursorAngle(el, x, y));
    },
    [],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();

        const angleStart = 110;
        const angleEnd = 465;
        setSweepActive(true);
        setCursorAngle(angleStart);

        animateValue({
          duration: 500,
          onUpdate: (v) => setEdgeProximity(v / 100),
        });
        animateValue({
          ease: easeInCubic,
          duration: 1500,
          end: 50,
          onUpdate: (v) =>
            setCursorAngle((angleEnd - angleStart) * (v / 100) + angleStart),
        });
        animateValue({
          ease: easeOutCubic,
          delay: 1500,
          duration: 2250,
          start: 50,
          end: 100,
          onUpdate: (v) =>
            setCursorAngle((angleEnd - angleStart) * (v / 100) + angleStart),
        });
        animateValue({
          ease: easeInCubic,
          delay: 2500,
          duration: 1500,
          start: 100,
          end: 0,
          onUpdate: (v) => setEdgeProximity(v / 100),
          onEnd: () => setSweepActive(false),
        });
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const colorSensitivity = edgeSensitivity + 20;
  const isVisible = isHovered || sweepActive;
  const borderOpacity = isVisible
    ? Math.max(
        0,
        (edgeProximity * 100 - colorSensitivity) / (100 - colorSensitivity),
      )
    : 0;
  const glowOpacity = isVisible
    ? Math.max(
        0,
        (edgeProximity * 100 - edgeSensitivity) / (100 - edgeSensitivity),
      )
    : 0;

  const meshGradients = buildMeshGradients(colors);
  const angleDeg = `${cursorAngle.toFixed(3)}deg`;
  const transition = isVisible
    ? "opacity 0.25s ease-out"
    : "opacity 0.75s ease-in-out";

  return (
    <div
      ref={containerRef}
      data-slot="border-glow"
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      className={cn("relative isolate", className)}
      style={{ borderRadius }}
      {...props}
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit]"
        style={{
          border: "1px solid transparent",
          background: [
            "linear-gradient(transparent 0 100%) padding-box",
            "linear-gradient(rgb(255 255 255 / 0%) 0% 100%) border-box",
            ...meshGradients.map((gradient) => `${gradient} border-box`),
          ].join(", "),
          opacity: borderOpacity,
          maskImage: `conic-gradient(from ${angleDeg} at center, black ${coneSpread}%, transparent ${coneSpread + 15}%, transparent ${100 - coneSpread - 15}%, black ${100 - coneSpread}%)`,
          WebkitMaskImage: `conic-gradient(from ${angleDeg} at center, black ${coneSpread}%, transparent ${coneSpread + 15}%, transparent ${100 - coneSpread - 15}%, black ${100 - coneSpread}%)`,
          transition,
        }}
      />

      <span
        className="pointer-events-none absolute z-10 rounded-[inherit]"
        style={{
          inset: -glowRadius,
          maskImage: `conic-gradient(from ${angleDeg} at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%)`,
          WebkitMaskImage: `conic-gradient(from ${angleDeg} at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%)`,
          opacity: glowOpacity,
          mixBlendMode: "plus-lighter",
          transition,
        }}
      >
        <span
          className="absolute rounded-[inherit]"
          style={{
            inset: glowRadius,
            boxShadow: buildBoxShadow(glowColor, glowIntensity),
          }}
        />
      </span>

      <div className="relative z-0 rounded-[inherit]">{children}</div>
    </div>
  );
}

export { BorderGlow };
