"use client";

import { useEffect, useState } from "react";

import { cn } from "@/libs/utils";

import { useDeviceStatusBarContext } from "./status-bar-context";
import {
  BatteryIcon,
  CellularConnectionIcon,
  WifiIcon,
} from "./status-bar-icons";

const TIME_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** Relógio real do dispositivo do usuário, não mockado — atualiza a cada 15s. */
function useDeviceClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(timer);
  }, []);

  return now;
}

function StatusBar() {
  const { variant } = useDeviceStatusBarContext();
  const now = useDeviceClock();

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 top-2 z-30 flex h-7 items-center justify-between px-6 text-[13px] font-semibold transition-colors duration-300",
        variant === "light" ? "text-white" : "text-neutral-900",
      )}
    >
      <span>{now ? TIME_FORMATTER.format(now) : ""}</span>
      <div className="flex items-center gap-1.5">
        <CellularConnectionIcon className="h-3 w-auto" />
        <WifiIcon className="h-3 w-auto" />
        <BatteryIcon className="h-[13px] w-auto" />
      </div>
    </div>
  );
}

export { StatusBar };
