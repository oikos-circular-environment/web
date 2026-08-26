"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";

import {
  CURSOR_MASK,
  CURSOR_RADIUS,
  DOT_RADIUS,
  DOT_SPACING,
  FIELD_MASK,
  GLOW_DOT_RADIUS,
} from "./constants";
import { IconCell } from "./icon-cell";
import type { LordIconData } from "./icons";
import { pickRandomIcon } from "./icons";
import { useCursorCellGrid } from "./use-cursor-cell-grid";
import { useIsTouchDevice } from "./use-is-touch-device";
import { useRandomSparkleCells } from "./use-random-sparkle-cells";

type MountedCell = {
  x: number;
  y: number;
  icon: LordIconData;
  active: boolean;
};

function DotField() {
  const glowRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isTouchDevice = useIsTouchDevice();
  const { cells: cursorCells } = useCursorCellGrid(
    containerRef,
    !isTouchDevice,
  );
  const { cells: sparkleCells } = useRandomSparkleCells(
    containerRef,
    isTouchDevice,
  );
  const cells = isTouchDevice ? sparkleCells : cursorCells;
  const [mountedCells, setMountedCells] = useState<Map<string, MountedCell>>(
    () => new Map(),
  );

  useEffect(() => {
    setMountedCells((current) => {
      const next = new Map(current);
      let changed = false;

      for (const [id, cell] of cells) {
        const existing = next.get(id);
        if (existing) {
          if (!existing.active) {
            next.set(id, { ...existing, active: true });
            changed = true;
          }
          continue;
        }
        next.set(id, { ...cell, active: true, icon: pickRandomIcon() });
        changed = true;
      }

      for (const [id, cell] of next) {
        if (cell.active && !cells.has(id)) {
          next.set(id, { ...cell, active: false });
          changed = true;
        }
      }

      return changed ? next : current;
    });
  }, [cells]);

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

  function handleExited(id: string) {
    setMountedCells((current) => {
      if (!current.has(id)) return current;
      const next = new Map(current);
      next.delete(id);
      return next;
    });
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      ref={containerRef}
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

      {Array.from(mountedCells, ([id, cell]) => (
        <IconCell
          active={cell.active}
          icon={cell.icon}
          key={id}
          onExited={() => handleExited(id)}
          x={cell.x}
          y={cell.y}
        />
      ))}
    </div>
  );
}

export { DotField };
