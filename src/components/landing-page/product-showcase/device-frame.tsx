"use client";

import type * as React from "react";

import { cn } from "@/libs/utils";
import { StatusBar } from "./status-bar";
import { DeviceStatusBarProvider } from "./status-bar-context";

const FRAME_WIDTH = 360;
const FRAME_HEIGHT = 760;

function DeviceFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden bg-[#1a1a1a] shadow-2xl",
        className,
      )}
      style={{
        width: FRAME_WIDTH,
        height: FRAME_HEIGHT,
        borderRadius: 56,
        boxShadow:
          "0 50px 100px -20px rgba(0,0,0,0.45), 0 30px 60px -30px rgba(0,0,0,0.35)",
      }}
    >
      <div
        className="absolute inset-0 rounded-[56px] ring-1 ring-inset ring-white/10"
        aria-hidden="true"
      />

      <div
        className="absolute left-1/2 top-3 z-20 h-7 w-28 -translate-x-1/2 rounded-full bg-black"
        aria-hidden="true"
      />

      <div
        className="device-mock absolute inset-[10px] overflow-hidden rounded-[44px] bg-background"
        style={{ width: FRAME_WIDTH - 20, height: FRAME_HEIGHT - 20 }}
      >
        <DeviceStatusBarProvider>
          <StatusBar />
          <div className="scrollbar-none h-full w-full touch-pan-y overflow-x-hidden overflow-y-auto overscroll-contain">
            {children}
          </div>
        </DeviceStatusBarProvider>
      </div>

      <div
        className="absolute bottom-2 left-1/2 z-20 h-1 w-32 -translate-x-1/2 rounded-full bg-white/20"
        aria-hidden="true"
      />
    </div>
  );
}

export { DeviceFrame, FRAME_HEIGHT, FRAME_WIDTH };
