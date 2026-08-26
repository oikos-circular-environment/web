"use client";

import type { ReactNode } from "react";

import { DeviceFrame } from "@/components/landing-page/product-showcase/device-frame";
import { MockIdentityProvider } from "@/components/landing-page/product-showcase/mock-identity/mock-identity-context";
import { HomeScreen } from "@/components/landing-page/product-showcase/screens/home";
import { MarketListScreen } from "@/components/landing-page/product-showcase/screens/pontos-de-coleta";
import { ReportMapScreen } from "@/components/landing-page/product-showcase/screens/report-map";
import { cn } from "@/libs/utils";

function FanDevice({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute bottom-0 left-1/2 origin-bottom",
        className,
      )}
    >
      <DeviceFrame>{children}</DeviceFrame>
    </div>
  );
}

function DeviceFan() {
  return (
    <MockIdentityProvider>
      <div
        aria-hidden="true"
        className="relative mt-16 h-[420px] w-full sm:h-[550px]"
      >
        <FanDevice className="-translate-x-[calc(50%+110px)] -rotate-[9deg] scale-[0.48] opacity-50 sm:-translate-x-[calc(50%+150px)] sm:scale-[0.62]">
          <ReportMapScreen />
        </FanDevice>

        <FanDevice className="translate-x-[calc(-50%+110px)] z-10 scale-[0.48] rotate-[9deg] opacity-50 sm:translate-x-[calc(-50%+150px)] sm:scale-[0.62]">
          <MarketListScreen />
        </FanDevice>

        <FanDevice className="z-20 -translate-x-1/2 scale-[0.55] sm:scale-[0.72]">
          <HomeScreen />
        </FanDevice>
      </div>
    </MockIdentityProvider>
  );
}

export { DeviceFan };
