"use client";

import { Map as MapcnMap, MapMarker, MarkerContent } from "@/components/ui/map";
import { cn } from "@/libs/utils";

import { HeroMapPopupCard } from "./hero-map-popup-card";
import { useAutoCycle } from "./hooks/use-auto-cycle";
import { HERO_MAP_LOCATIONS } from "./locations";

/** Rondonópolis, MT — mesma localização mock usada nas telas de Pontos de coleta. */
const CENTER: [number, number] = [-54.636, -16.471];
const CYCLE_INTERVAL_MS = 4500;

function HeroMapBackground() {
  const activeIndex = useAutoCycle(
    HERO_MAP_LOCATIONS.length,
    CYCLE_INTERVAL_MS,
  );
  const activeLocation = HERO_MAP_LOCATIONS[activeIndex];

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <MapcnMap
        attributionControl={false}
        boxZoom={false}
        center={CENTER}
        doubleClickZoom={false}
        dragPan={false}
        dragRotate={false}
        keyboard={false}
        scrollZoom={false}
        touchZoomRotate={false}
        zoom={14}
      >
        {HERO_MAP_LOCATIONS.map((location, index) => (
          <MapMarker
            key={location.id}
            latitude={location.latitude}
            longitude={location.longitude}
          >
            <MarkerContent>
              <span
                className={cn(
                  "block size-2.5 rounded-full border-2 border-white/80 bg-primary shadow-[0_0_0_4px_rgba(132,204,22,0.25)] transition-transform duration-300",
                  index === activeIndex && "scale-150",
                )}
              />
            </MarkerContent>
          </MapMarker>
        ))}
      </MapcnMap>

      {/* Posição fixa (não segue a coordenada real do pino no mapa) do lado
          oposto ao texto do Hero, que agora fica alinhado à esquerda. */}
      {activeLocation ? (
        <div
          className="animate-in fade-in-0 slide-in-from-bottom-2 absolute right-6 bottom-8 hidden duration-300 md:right-10 md:block lg:right-20"
          key={activeLocation.id}
        >
          <HeroMapPopupCard location={activeLocation} />
        </div>
      ) : null}
    </div>
  );
}

export { HeroMapBackground };
