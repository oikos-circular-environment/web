"use client";

import {
  ChevronDown,
  ChevronsUp,
  ChevronUp,
  Hash,
  List,
  LocateFixed,
  MapIcon,
  MapPin,
  MapPinned,
  Minus,
  Moon,
  Navigation2,
  Plus,
  Radar,
  Recycle,
  Settings2,
  Shield,
  ShieldCheck,
  Sun,
  Trash2,
} from "lucide-react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Map as MapcnMap,
  MapGeoJSON,
  MapMarker,
  MarkerContent,
  useMap,
} from "@/components/ui/map";
import { cn } from "@/libs/utils";

import { useWasteCategories } from "../hooks/use-waste-categories";
import { useSetStatusBarVariant } from "../status-bar-context";

/** Rondonópolis, MT — mesma localização mock usada no filtro de Pontos de coleta. */
const CENTER: [number, number] = [-54.636, -16.471];

type HazardLevel = "low" | "medium" | "high" | "very_high";
type ComplaintStatus = "OPEN" | "RESOLVED";

type Complaint = {
  id: string;
  lat: number;
  lon: number;
  observations: string;
  address: string;
  status: ComplaintStatus;
};

const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: "a1b2c3d4",
    lat: -16.4658,
    lon: -54.6402,
    observations: "Sacos de lixo e entulho acumulados na calçada.",
    address: "Rua Barão do Rio Branco — Centro",
    status: "OPEN",
  },
  {
    id: "e5f6a7b8",
    lat: -16.4775,
    lon: -54.6291,
    observations: "Descarte de pilhas e baterias em terreno baldio.",
    address: "Av. Presidente Marques — Jardim Guanabara",
    status: "OPEN",
  },
  {
    id: "c9d0e1f2",
    lat: -16.4622,
    lon: -54.6455,
    observations: "Queima de resíduos a céu aberto próximo à escola.",
    address: "Rua Marechal Deodoro — Vila Aurora",
    status: "RESOLVED",
  },
  {
    id: "b3c4d5e6",
    lat: -16.4801,
    lon: -54.6501,
    observations: "Ponto viciado de descarte de móveis velhos.",
    address: "Rua Goiás — Jardim Ipanema",
    status: "OPEN",
  },
];

/** Maior nível de periculosidade entre as subcategorias — mesma prioridade do `highestHazardVariant` do mobile. */
function highestHazardVariant(
  levels: Array<"LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH">,
): HazardLevel {
  const priority: Record<string, number> = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    VERY_HIGH: 4,
  };
  const highest = levels.reduce(
    (max, level) => (priority[level] > priority[max] ? level : max),
    levels[0] ?? "LOW",
  );
  return highest.toLowerCase() as HazardLevel;
}

/** Distância geodésica em metros (haversine) — mesmo uso do `getDistance` (geolib) no mobile. */
function distanceMeters(a: [number, number], b: [number, number]) {
  const earthRadius = 6371000;
  const [lon1, lat1] = a;
  const [lon2, lat2] = b;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const sin =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(sin), Math.sqrt(1 - sin));
}

function formatDistanceMeters(meters: number) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

const HAZARD_STYLES: Record<
  HazardLevel,
  { classes: string; icon: typeof ChevronDown; label: string }
> = {
  low: {
    classes: "border-lime-200 bg-lime-50 text-lime-600",
    icon: ChevronDown,
    label: "Baixa",
  },
  medium: {
    classes: "border-yellow-200 bg-yellow-50 text-yellow-600",
    icon: Minus,
    label: "Média",
  },
  high: {
    classes: "border-orange-200 bg-orange-50 text-orange-600",
    icon: ChevronUp,
    label: "Alta",
  },
  very_high: {
    classes: "border-red-200 bg-red-50 text-red-600",
    icon: ChevronsUp,
    label: "Muito alta",
  },
};

const STATUS_STYLES: Record<
  ComplaintStatus,
  { classes: string; icon: typeof Shield; label: string }
> = {
  OPEN: {
    classes: "bg-sky-500/15 text-sky-500",
    icon: Shield,
    label: "Aberta",
  },
  RESOLVED: {
    classes: "bg-lime-600/15 text-lime-600",
    icon: ShieldCheck,
    label: "Resolvida",
  },
};

const MARKER_PIN_PATH =
  "M4.74,21.5 A13,13 0 1 1 27.26,21.5 L18.6,36.5 A3,3 0 0 1 13.4,36.5 Z";

function ComplaintPin({ selected }: { selected?: boolean }) {
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
        strokeWidth={selected ? 2.5 : 1.5}
      />
    </svg>
  );
}

function ComplaintListItem({
  complaint,
  category,
  isSelected,
  onSelect,
}: {
  complaint: Complaint;
  category: { name: string; hazard: HazardLevel } | null;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const distance = formatDistanceMeters(
    distanceMeters(CENTER, [complaint.lon, complaint.lat]),
  );
  const status = STATUS_STYLES[complaint.status];
  const StatusIcon = status.icon;
  const hazard = category ? HAZARD_STYLES[category.hazard] : null;
  const HazardIcon = hazard?.icon;

  return (
    <button
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3 text-left",
        isSelected && "bg-amber-50",
      )}
      onClick={onSelect}
      type="button"
    >
      <div className="flex size-14 shrink-0 items-center justify-center rounded-md bg-amber-500">
        <Trash2 className="size-5 text-white" strokeWidth={2.5} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="inline-flex w-fit items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
          <Hash className="size-2.5" strokeWidth={2.5} />
          {complaint.id}
        </span>

        <p className="truncate text-sm font-bold text-gray-900">
          DESCARTE IRREGULAR
        </p>

        <p className="truncate text-xs text-gray-500">
          {complaint.observations}
        </p>

        <div className="flex items-center gap-1 pt-0.5">
          <MapPin className="size-2.5 shrink-0 text-gray-400" strokeWidth={2} />
          <span className="truncate text-xs text-gray-400">
            {complaint.address} • {distance}
          </span>
        </div>

        <div className="scrollbar-none flex items-center gap-1.5 overflow-x-auto pt-1">
          <span
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold",
              status.classes,
            )}
          >
            <StatusIcon className="size-2.5" strokeWidth={2.5} />
            {status.label}
          </span>
          {category && hazard && HazardIcon ? (
            <span
              className={cn(
                "flex shrink-0 items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold",
                hazard.classes,
              )}
            >
              <HazardIcon className="size-2.5" strokeWidth={3} />
              {category.name}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}

const LIST_PEEK_HEIGHT = "15%";
const LIST_EXPANDED_HEIGHT = "42%";

type ComplaintWithCategory = Complaint & {
  category: { name: string; hazard: HazardLevel } | null;
};

function ComplaintsListSheet({
  complaints,
  selectedId,
  onSelect,
  expanded,
  onToggleExpanded,
}: {
  complaints: ComplaintWithCategory[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  expanded: boolean;
  onToggleExpanded: () => void;
}) {
  return (
    <div
      className="absolute inset-x-0 bottom-0 z-20 flex flex-col rounded-t-md border-t border-border bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.08)] transition-[height] duration-300 ease-out"
      style={{ height: expanded ? LIST_EXPANDED_HEIGHT : LIST_PEEK_HEIGHT }}
    >
      <button
        aria-label={expanded ? "Recolher lista" : "Expandir lista"}
        className="flex shrink-0 cursor-pointer items-center justify-center py-2.5"
        onClick={onToggleExpanded}
        type="button"
      >
        <span className="h-1 w-10 rounded-full bg-gray-300" />
      </button>

      <div className="shrink-0 px-4 pb-2">
        <span className="text-xs font-medium text-gray-500">
          {complaints.length}{" "}
          {complaints.length === 1
            ? "denúncia encontrada"
            : "denúncias encontradas"}
        </span>
      </div>

      <div className="scrollbar-none flex-1 divide-y divide-gray-100 overflow-y-auto">
        {complaints.map((complaint) => (
          <ComplaintListItem
            category={complaint.category}
            complaint={complaint}
            isSelected={selectedId === complaint.id}
            key={complaint.id}
            onSelect={() => onSelect(complaint.id)}
          />
        ))}
      </div>
    </div>
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
    <div
      className="absolute top-24 right-3 z-10 flex flex-col justify-center gap-2"
      style={{ bottom: `calc(${LIST_PEEK_HEIGHT} + 0.75rem)` }}
    >
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
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(
    null,
  );
  const [isListExpanded, setIsListExpanded] = useState(false);
  const { categories } = useWasteCategories();

  useSetStatusBarVariant(isDarkMap ? "light" : "dark");

  const complaintsWithCategories = useMemo<ComplaintWithCategory[]>(
    () =>
      MOCK_COMPLAINTS.map((complaint, index) => {
        const category = categories.length
          ? categories[index % categories.length]
          : null;
        return {
          ...complaint,
          category: category
            ? {
                name: category.name,
                hazard: highestHazardVariant(category.hazard_levels),
              }
            : null,
        };
      }),
    [categories],
  );

  const handleSelectComplaint = useCallback((id: string) => {
    setSelectedComplaintId((current) => {
      const next = current === id ? null : id;
      setIsListExpanded(next === null);
      return next;
    });
  }, []);

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
            onClick={() => handleSelectComplaint(complaint.id)}
          >
            <MarkerContent>
              <ComplaintPin selected={selectedComplaintId === complaint.id} />
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

      <div
        className="absolute right-3 z-10 flex items-center gap-2"
        style={{ bottom: `calc(${LIST_PEEK_HEIGHT} + 0.75rem)` }}
      >
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

      <ComplaintsListSheet
        complaints={complaintsWithCategories}
        expanded={isListExpanded}
        onSelect={handleSelectComplaint}
        onToggleExpanded={() => setIsListExpanded((v) => !v)}
        selectedId={selectedComplaintId}
      />
    </div>
  );
}

export { ReportMapScreen };
