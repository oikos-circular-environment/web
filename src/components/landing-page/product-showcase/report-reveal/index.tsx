"use client";

import Image from "next/image";
import type { RefObject } from "react";

import { useScrollSync } from "@/components/landing-page/hooks/use-scroll-sync";
import { cn } from "@/libs/utils";

import { ReportMapScreen } from "../screens/report-map";

const START_SCALE = 1.65;
const SETTLE_AT = 0.55;

function ReportReveal({
  trackRef,
}: {
  trackRef: RefObject<HTMLElement | null>;
}) {
  const progress = useScrollSync(trackRef);
  const settleProgress = Math.min(progress / SETTLE_AT, 1);
  const scale = START_SCALE - (START_SCALE - 1) * settleProgress;
  const revealed = settleProgress >= 1;

  return (
    <div className="relative size-full overflow-hidden bg-[#1a1a1a]">
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          revealed ? "opacity-0" : "opacity-100",
        )}
        style={{ transform: `scale(${scale})` }}
      >
        <Image
          alt="Descarte irregular de pneus e entulho registrado por uma denúncia"
          className="object-cover"
          fill
          sizes="360px"
          src="/device-preview/home/denuncias.jpg"
        />
      </div>

      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          revealed ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ReportMapScreen />
      </div>
    </div>
  );
}

export { ReportReveal };
