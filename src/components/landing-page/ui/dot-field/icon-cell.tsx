"use client";

import { Player } from "@lordicon/react";
import { animate } from "animejs";
import { useEffect, useRef } from "react";

import {
  CROSSFADE_EXIT_DURATION,
  ICON_SIZE,
  PLAYER_ENTER_DELAY,
  PLAYER_ENTER_DURATION,
  SQUARE_EXIT_DURATION,
  SQUARE_SIZE,
} from "./constants";
import type { LordIconData } from "./icons";

type IconCellProps = {
  x: number;
  y: number;
  active: boolean;
  icon: LordIconData;
  onExited: () => void;
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function IconCell({ x, y, active, icon, onExited }: IconCellProps) {
  const squareRef = useRef<HTMLDivElement>(null);
  const playerWrapperRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: onExited é recriada a cada render do pai mas sempre chama handleExited com o mesmo id desta célula; só `active` deve re-disparar a transição.
  useEffect(() => {
    const square = squareRef.current;
    const wrapper = playerWrapperRef.current;
    if (!square || !wrapper) return;

    if (prefersReducedMotion()) {
      square.style.opacity = active ? "0" : "1";
      wrapper.style.opacity = active ? "1" : "0";
      if (active) playerRef.current?.playFromBeginning();
      else onExited();
      return;
    }

    const squareOpacity = Number(getComputedStyle(square).opacity);
    const wrapperOpacity = Number(getComputedStyle(wrapper).opacity);
    const duration = active ? SQUARE_EXIT_DURATION : CROSSFADE_EXIT_DURATION;

    const squareAnimation = animate(square, {
      opacity: active ? [squareOpacity, 0] : [squareOpacity, 1],
      scale: active ? 0.4 : 1,
      duration,
      ease: "outQuad",
    });

    const wrapperAnimation = animate(wrapper, {
      opacity: active ? [wrapperOpacity, 1] : [wrapperOpacity, 0],
      scale: active ? 1 : 0.4,
      duration: active ? PLAYER_ENTER_DURATION : duration,
      delay: active ? PLAYER_ENTER_DELAY : 0,
      ease: "outQuad",
      onComplete: active
        ? () => playerRef.current?.playFromBeginning()
        : onExited,
    });

    return () => {
      squareAnimation.pause();
      wrapperAnimation.pause();
    };
  }, [active]);

  return (
    <>
      <div
        className="absolute bg-border"
        ref={squareRef}
        style={{
          height: SQUARE_SIZE,
          left: x - SQUARE_SIZE / 2,
          top: y - SQUARE_SIZE / 2,
          width: SQUARE_SIZE,
        }}
      />
      <div
        className="absolute text-landing-terracotta opacity-0"
        ref={playerWrapperRef}
        style={{
          height: ICON_SIZE,
          left: x - ICON_SIZE / 2,
          top: y - ICON_SIZE / 2,
          width: ICON_SIZE,
        }}
      >
        <Player icon={icon} ref={playerRef} size={ICON_SIZE} />
      </div>
    </>
  );
}

export { IconCell };
