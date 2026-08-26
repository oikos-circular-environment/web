"use client";

import { type RefObject, useEffect, useRef, useState } from "react";

import {
  DOT_SPACING,
  ICON_ACTIVE_MAX,
  ICON_GRID_STRIDE,
  ICON_RADIUS,
} from "./constants";

type GridCell = { x: number; y: number };

const ICON_GRID_SPACING = DOT_SPACING * ICON_GRID_STRIDE;

function computeActiveCells(localX: number, localY: number) {
  const colMin = Math.floor((localX - ICON_RADIUS) / ICON_GRID_SPACING);
  const colMax = Math.floor((localX + ICON_RADIUS) / ICON_GRID_SPACING);
  const rowMin = Math.floor((localY - ICON_RADIUS) / ICON_GRID_SPACING);
  const rowMax = Math.floor((localY + ICON_RADIUS) / ICON_GRID_SPACING);

  const candidates: Array<{ id: string; x: number; y: number; dist: number }> =
    [];

  for (let col = colMin; col <= colMax; col++) {
    for (let row = rowMin; row <= rowMax; row++) {
      const x = col * ICON_GRID_SPACING + ICON_GRID_SPACING / 2;
      const y = row * ICON_GRID_SPACING + ICON_GRID_SPACING / 2;
      const dist = Math.hypot(x - localX, y - localY);
      if (dist <= ICON_RADIUS) {
        candidates.push({ id: `${col}:${row}`, x, y, dist });
      }
    }
  }

  candidates.sort((a, b) => a.dist - b.dist);

  const result = new Map<string, GridCell>();
  for (const candidate of candidates.slice(0, ICON_ACTIVE_MAX)) {
    result.set(candidate.id, { x: candidate.x, y: candidate.y });
  }
  return result;
}

function sameCellIds(a: Map<string, GridCell>, b: Map<string, GridCell>) {
  if (a.size !== b.size) return false;
  for (const id of a.keys()) {
    if (!b.has(id)) return false;
  }
  return true;
}

function useCursorCellGrid(
  containerRef: RefObject<HTMLDivElement | null>,
  enabled: boolean,
) {
  const [cells, setCells] = useState<Map<string, GridCell>>(() => new Map());
  const cellsRef = useRef(cells);
  cellsRef.current = cells;

  // biome-ignore lint/correctness/useExhaustiveDependencies: containerRef é um RefObject estável; só `enabled` deve reanexar os listeners.
  useEffect(() => {
    if (!enabled) {
      if (cellsRef.current.size > 0) setCells(new Map());
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    let frame = 0;
    let pending: { x: number; y: number } | null = null;

    function scheduleUpdate() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!pending || !container) return;
        const rect = container.getBoundingClientRect();
        const next = computeActiveCells(
          pending.x - rect.left,
          pending.y - rect.top,
        );
        if (!sameCellIds(next, cellsRef.current)) {
          setCells(next);
        }
      });
    }

    function handlePointerMove(event: PointerEvent) {
      pending = { x: event.clientX, y: event.clientY };
      scheduleUpdate();
    }

    function handlePointerLeave() {
      pending = null;
      if (cellsRef.current.size > 0) setCells(new Map());
    }

    window.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerleave", handlePointerLeave);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled]);

  return { cells };
}

export { useCursorCellGrid };
