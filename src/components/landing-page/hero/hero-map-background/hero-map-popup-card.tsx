import { Clock, MapPin, Phone } from "lucide-react";

import { GlassPanel } from "@/components/landing-page/ui/glass-panel";

import type { HeroMapLocation } from "./locations";

function HeroMapPopupCard({ location }: { location: HeroMapLocation }) {
  return (
    <GlassPanel
      className="w-64 border border-foreground/10 bg-background/35 p-4"
      tone="dark"
    >
      <p className="text-xs font-medium tracking-[-0.01em] text-muted-foreground">
        {location.kind}
      </p>
      <p className="mt-0.5 text-sm font-medium tracking-[-0.02em] text-foreground">
        {location.name}
      </p>

      <div className="mt-3 flex flex-col gap-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <MapPin className="size-3 shrink-0" strokeWidth={2} />
          <span className="truncate">{location.address}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="size-3 shrink-0" strokeWidth={2} />
          <span>{location.hours}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Phone className="size-3 shrink-0" strokeWidth={2} />
          <span>{location.phone}</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {location.wasteTypes.map((waste) => (
          <span
            className="rounded-full bg-foreground/10 px-2 py-0.5 text-[11px] text-foreground"
            key={waste}
          >
            {waste}
          </span>
        ))}
      </div>
    </GlassPanel>
  );
}

export { HeroMapPopupCard };
