"use client";

import {
  List,
  LocateFixed,
  MapIcon,
  MapPinned,
  Minus,
  Moon,
  Navigation2,
  Plus,
  Radar,
  Recycle,
  Settings2,
  Shield,
  Sun,
} from "lucide-react";
import { type ReactNode, useCallback, useEffect, useState } from "react";

import {
  Map as MapcnMap,
  MapGeoJSON,
  MapMarker,
  MarkerContent,
  useMap,
} from "@/components/ui/map";
import { cn } from "@/libs/utils";

import { useSetStatusBarVariant } from "../status-bar-context";

/** Rondonópolis, MT — mesma localização mock usada no filtro de Pontos de coleta. */
const CENTER: [number, number] = [-54.636, -16.471];

const MOCK_COMPLAINTS = [
  { id: "c1", lat: -16.4658, lon: -54.6402 },
  { id: "c2", lat: -16.4775, lon: -54.6291 },
  { id: "c3", lat: -16.4622, lon: -54.6455 },
  { id: "c4", lat: -16.4801, lon: -54.6501 },
];

const MARKER_PIN_PATH =
  "M4.74,21.5 A13,13 0 1 1 27.26,21.5 L18.6,36.5 A3,3 0 0 1 13.4,36.5 Z";

function ComplaintPin() {
  return (
    <svg
      className="drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)]"
      height="33"
      viewBox="0 0 32 40"
      width="26"
    >
      <title>Denúncia</title>
      <path
        d={MARKER_PIN_PATH}
        fill="#f59e0b"
        stroke="white"
        strokeWidth={1.5}
      />
    </svg>
  );
}

/**
 * Círculo geodésico em metros reais (não pixels) — equivalente ao `<Circle radius>`
 * do react-native-maps. `ui/map.tsx` não tem um primitivo de círculo pronto, então
 * vira um polígono de N pontos alimentando o `MapGeoJSON` que já existe.
 */
function createGeoCircle(
  center: [number, number],
  radiusMeters: number,
  points = 64,
) {
  const [lon, lat] = center;
  const earthRadius = 6371000;
  const latRad = (lat * Math.PI) / 180;
  const coordinates: [number, number][] = [];

  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const dx =
      (radiusMeters * Math.cos(angle)) / (earthRadius * Math.cos(latRad));
    const dy = (radiusMeters * Math.sin(angle)) / earthRadius;
    coordinates.push([lon + (dx * 180) / Math.PI, lat + (dy * 180) / Math.PI]);
  }

  return {
    type: "Feature" as const,
    properties: {},
    geometry: { type: "Polygon" as const, coordinates: [coordinates] },
  };
}

const USER_RADIUS_GEOJSON = createGeoCircle(CENTER, 2500);

const CONTROL_BUTTON_TONE = {
  default: "bg-white text-gray-700",
  active: "bg-lime-800 text-white",
  primary: "bg-primary text-white",
} as const;

function ControlButton({
  tone = "default",
  onClick,
  label,
  children,
}: {
  tone?: keyof typeof CONTROL_BUTTON_TONE;
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      aria-label={label}
      className={cn(
        "flex items-center justify-center rounded-md p-2 shadow-md",
        CONTROL_BUTTON_TONE[tone],
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function useMapBearing() {
  const { map } = useMap();
  const [bearing, setBearing] = useState(0);

  useEffect(() => {
    if (!map) return;
    const update = () => setBearing(map.getBearing());
    map.on("rotate", update);
    return () => {
      map.off("rotate", update);
    };
  }, [map]);

  return bearing;
}

function MapControlsColumn({
  isDarkMap,
  onToggleDark,
  showUserLocation,
  onToggleUserLocation,
}: {
  isDarkMap: boolean;
  onToggleDark: () => void;
  showUserLocation: boolean;
  onToggleUserLocation: () => void;
}) {
  const { map } = useMap();
  const bearing = useMapBearing();

  const zoomIn = useCallback(() => {
    map?.zoomTo(map.getZoom() + 1, { duration: 300 });
  }, [map]);

  const zoomOut = useCallback(() => {
    map?.zoomTo(map.getZoom() - 1, { duration: 300 });
  }, [map]);

  const resetNorth = useCallback(() => {
    map?.resetNorthPitch({ duration: 300 });
  }, [map]);

  const goToLocation = useCallback(() => {
    map?.flyTo({ center: CENTER, zoom: 14, duration: 1500 });
  }, [map]);

  return (
    <div className="absolute inset-y-24 right-3 z-10 flex flex-col justify-center gap-2">
      <ControlButton label="Aumentar zoom" onClick={zoomIn}>
        <Plus className="size-4" strokeWidth={2.2} />
      </ControlButton>
      <ControlButton label="Diminuir zoom" onClick={zoomOut}>
        <Minus className="size-4" strokeWidth={2.2} />
      </ControlButton>
      <ControlButton
        label="Mostrar minha localização"
        onClick={onToggleUserLocation}
        tone={showUserLocation ? "active" : "default"}
      >
        {showUserLocation ? (
          <MapPinned className="size-4" strokeWidth={2.2} />
        ) : (
          <MapIcon className="size-4" strokeWidth={2.2} />
        )}
      </ControlButton>
      <ControlButton label="Alternar mapa escuro" onClick={onToggleDark}>
        {isDarkMap ? (
          <Sun className="size-4 text-amber-500" strokeWidth={2.2} />
        ) : (
          <Moon className="size-4" strokeWidth={2.2} />
        )}
      </ControlButton>
      <ControlButton
        label="Resetar direção para o norte"
        onClick={resetNorth}
        tone="primary"
      >
        <Navigation2
          className="size-4"
          strokeWidth={2.2}
          style={{ transform: `rotate(${-bearing}deg)` }}
        />
      </ControlButton>
      <ControlButton label="Ir para minha localização" onClick={goToLocation}>
        <LocateFixed className="size-4" strokeWidth={2.2} />
      </ControlButton>
    </div>
  );
}

const FILTER_CHIPS = [
  { id: "hazard", icon: Radar, label: "Todos" },
  { id: "category", icon: Recycle, label: "Todos" },
  { id: "status", icon: Shield, label: "Todos" },
  { id: "radius", icon: Radar, label: "10 km" },
];

function FilterRow() {
  return (
    <div className="absolute inset-x-3 top-12 z-10 flex items-center gap-2">
      <div className="flex h-12 min-w-0 flex-1 items-center rounded-md border border-border bg-white px-3 shadow-sm">
        <div className="scrollbar-none flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
          {FILTER_CHIPS.map((chip) => (
            <span
              className="flex shrink-0 items-center gap-1.5 rounded-sm bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground"
              key={chip.id}
            >
              <chip.icon className="h-3 w-3" strokeWidth={2} />
              {chip.label}
            </span>
          ))}
        </div>
      </div>
      <button
        aria-label="Filtros"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-lime-800 shadow-sm"
        type="button"
      >
        <Settings2 className="h-4.5 w-4.5 text-white" strokeWidth={2} />
      </button>
    </div>
  );
}

function ReportMapScreen() {
  const [isDarkMap, setIsDarkMap] = useState(false);
  const [showUserLocation, setShowUserLocation] = useState(true);

  useSetStatusBarVariant(isDarkMap ? "light" : "dark");

  return (
    <div className="relative h-full w-full">
      <MapcnMap center={CENTER} theme={isDarkMap ? "dark" : "light"} zoom={13}>
        <MapGeoJSON
          data={USER_RADIUS_GEOJSON}
          fillPaint={{ "fill-color": "#84cc16", "fill-opacity": 0.12 }}
          linePaint={{ "line-color": "#84cc16", "line-width": 2 }}
        />

        {showUserLocation ? (
          <MapMarker latitude={CENTER[1]} longitude={CENTER[0]}>
            <MarkerContent>
              <div className="h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-lg" />
            </MarkerContent>
          </MapMarker>
        ) : null}

        {MOCK_COMPLAINTS.map((complaint) => (
          <MapMarker
            anchor="bottom"
            key={complaint.id}
            latitude={complaint.lat}
            longitude={complaint.lon}
          >
            <MarkerContent>
              <ComplaintPin />
            </MarkerContent>
          </MapMarker>
        ))}

        <MapControlsColumn
          isDarkMap={isDarkMap}
          onToggleDark={() => setIsDarkMap((v) => !v)}
          onToggleUserLocation={() => setShowUserLocation((v) => !v)}
          showUserLocation={showUserLocation}
        />
      </MapcnMap>

      <FilterRow />

      <div className="absolute right-3 bottom-3 z-10 flex items-center gap-2">
        <button
          aria-label="Ver lista de denúncias"
          className="flex h-12.5 w-12.5 items-center justify-center rounded-md bg-white shadow-md"
          type="button"
        >
          <List className="h-5 w-5 text-gray-700" strokeWidth={2} />
        </button>
        <button
          aria-label="Nova denúncia"
          className="flex h-12.5 w-12.5 items-center justify-center rounded-md bg-lime-800 shadow-md"
          type="button"
        >
          <Plus className="h-6 w-6 text-white" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}

export { ReportMapScreen };
