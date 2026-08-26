"use client";

import { type RefObject, useEffect, useRef, useState } from "react";

import {
  SPARKLE_EDGE_MARGIN,
  SPARKLE_GAP_MAX_MS,
  SPARKLE_GAP_MIN_MS,
  SPARKLE_HOLD_MAX_MS,
  SPARKLE_HOLD_MIN_MS,
  SPARKLE_SLOTS,
} from "./constants";

type SparkleCell = { x: number; y: number };

function randomInRange(min: number, max: number) {
  if (max <= min) return min;
  return min + Math.random() * (max - min);
}

function useRandomSparkleCells(
  containerRef: RefObject<HTMLDivElement | null>,
  enabled: boolean,
) {
  const [cells, setCells] = useState<Map<string, SparkleCell>>(() => new Map());
  const nextId = useRef(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: containerRef é um RefObject estável; só `enabled` deve reiniciar o loop de spawn.
  useEffect(() => {
    if (!enabled) {
      setCells(new Map());
      return;
    }

    let disposed = false;
    const timers: number[] = [];

    function spawn() {
      if (disposed) return;
      const container = containerRef.current;
      if (!container) {
        const retryTimer = window.setTimeout(spawn, SPARKLE_GAP_MIN_MS);
        timers.push(retryTimer);
        return;
      }

      const rect = container.getBoundingClientRect();
      const visibleTop = Math.max(0, -rect.top);
      const visibleBottom = Math.min(
        rect.height,
        window.innerHeight - rect.top,
      );

      if (visibleBottom - visibleTop < SPARKLE_EDGE_MARGIN * 2) {
        const retryTimer = window.setTimeout(spawn, SPARKLE_GAP_MIN_MS);
        timers.push(retryTimer);
        return;
      }

      const id = `sparkle-${nextId.current++}`;
      const x = randomInRange(
        SPARKLE_EDGE_MARGIN,
        rect.width - SPARKLE_EDGE_MARGIN,
      );
      const y = randomInRange(
        visibleTop + SPARKLE_EDGE_MARGIN,
        visibleBottom - SPARKLE_EDGE_MARGIN,
      );

      setCells((current) => {
        const next = new Map(current);
        next.set(id, { x, y });
        return next;
      });

      const holdTimer = window.setTimeout(
        () => {
          setCells((current) => {
            if (!current.has(id)) return current;
            const next = new Map(current);
            next.delete(id);
            return next;
          });
          const gapTimer = window.setTimeout(
            spawn,
            randomInRange(SPARKLE_GAP_MIN_MS, SPARKLE_GAP_MAX_MS),
          );
          timers.push(gapTimer);
        },
        randomInRange(SPARKLE_HOLD_MIN_MS, SPARKLE_HOLD_MAX_MS),
      );
      timers.push(holdTimer);
    }

    for (let slot = 0; slot < SPARKLE_SLOTS; slot++) {
      const startTimer = window.setTimeout(
        spawn,
        randomInRange(0, SPARKLE_HOLD_MAX_MS),
      );
      timers.push(startTimer);
    }

    return () => {
      disposed = true;
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, [enabled]);

  return { cells };
}

export { useRandomSparkleCells };
