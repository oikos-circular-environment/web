"use client";

import { format, formatDistanceToNowStrict } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  ChevronDown,
  ChevronsUp,
  ChevronUp,
  Crosshair,
  Hash,
  List,
  LocateFixed,
  Lock,
  MapIcon,
  MapPin,
  MapPinned,
  Minus,
  Moon,
  Navigation2,
  Paperclip,
  Plus,
  Radar,
  Radiation,
  Recycle,
  Settings2,
  Shield,
  ShieldCheck,
  ShieldX,
  Sun,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
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

import { useComplaintsMap } from "../hooks/use-complaints-map";
import { useWasteCategories } from "../hooks/use-waste-categories";
import { useMockIdentity } from "../mock-identity/mock-identity-context";
import { PERSONAS } from "../mock-identity/personas";
import { useMockResolutions } from "../mock-identity/use-mock-resolutions";
import { useMockVotes } from "../mock-identity/use-mock-votes";
import { useSetStatusBarVariant } from "../status-bar-context";

/** Rondonópolis, MT — mesma localização mock usada no filtro de Pontos de coleta. */
const CENTER: [number, number] = [-54.636, -16.471];

type HazardLevel = "low" | "medium" | "high" | "very_high";
type ComplaintStatus = "OPEN" | "RESOLVED" | "CANCELED";
type ApiHazardLevel = "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";

type MapComplaint = {
  id: string;
  lat: number;
  lon: number;
  observations: string | null;
  address: string | null;
  status: ComplaintStatus;
  categories: { id: string; name: string; hazard: HazardLevel }[];
  createdAt: Date;
  voteCounts: { resolved: number; notResolved: number };
  resolutionCount: number;
  attachmentCount: number;
};

type FilterState = {
  status: "ALL" | "OPEN" | "RESOLVED";
  categoryId: string | null;
  categoryName: string | null;
  hazardLevel: "all" | HazardLevel;
  radius: number;
};

const DEFAULT_FILTERS: FilterState = {
  status: "OPEN",
  categoryId: null,
  categoryName: null,
  hazardLevel: "all",
  radius: 2000,
};

const RADIUS_OPTIONS = [
  { label: "2 km", value: 2000 },
  { label: "5 km", value: 5000 },
  { label: "10 km", value: 10000 },
  { label: "15 km", value: 15000 },
  { label: "20 km", value: 20000 },
  { label: "30 km", value: 30000 },
  { label: "40 km", value: 40000 },
];

const STATUS_FILTER_OPTIONS = [
  { key: "ALL", label: "Todos", icon: null },
  { key: "OPEN", label: "Aberta", icon: Shield },
  { key: "RESOLVED", label: "Resolvida", icon: ShieldCheck },
] as const;

const HAZARD_FILTER_OPTIONS = [
  { key: "all", label: "Todos", icon: null },
  { key: "low", label: "Baixa", icon: ChevronDown },
  { key: "medium", label: "Média", icon: Minus },
  { key: "high", label: "Alta", icon: ChevronUp },
  { key: "very_high", label: "Muito alta", icon: ChevronsUp },
] as const;

/** Maior nível de periculosidade entre as subcategorias — mesma prioridade do `highestHazardVariant` do mobile. */
function highestHazardVariant(levels: ApiHazardLevel[]): HazardLevel {
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

function deriveAddress(addresses: {
  street: string | null;
  streetNumber: string | null;
  district: string | null;
}) {
  const streetPart = [addresses.street, addresses.streetNumber]
    .filter(Boolean)
    .join(", ");
  return [streetPart, addresses.district].filter(Boolean).join(" — ") || null;
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
  CANCELED: {
    classes: "bg-red-600/15 text-red-600",
    icon: ShieldX,
    label: "Cancelada",
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
  isSelected,
  onSelect,
}: {
  complaint: MapComplaint;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const distance = formatDistanceMeters(
    distanceMeters(CENTER, [complaint.lon, complaint.lat]),
  );
  const status = STATUS_STYLES[complaint.status];
  const StatusIcon = status.icon;

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
          {complaint.id.slice(0, 8)}
        </span>

        <p className="truncate text-sm font-bold text-gray-900">
          DESCARTE IRREGULAR
        </p>

        {complaint.observations ? (
          <p className="truncate text-xs text-gray-500">
            {complaint.observations}
          </p>
        ) : null}

        {complaint.address ? (
          <div className="flex items-center gap-1 pt-0.5">
            <MapPin
              className="size-2.5 shrink-0 text-gray-400"
              strokeWidth={2}
            />
            <span className="truncate text-xs text-gray-400">
              {complaint.address} • {distance}
            </span>
          </div>
        ) : null}

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
          {complaint.categories.map((category) => {
            const hazard = HAZARD_STYLES[category.hazard];
            const HazardIcon = hazard.icon;
            return (
              <span
                className={cn(
                  "flex shrink-0 items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold",
                  hazard.classes,
                )}
                key={category.id}
              >
                <HazardIcon className="size-2.5" strokeWidth={3} />
                {category.name}
              </span>
            );
          })}
        </div>
      </div>
    </button>
  );
}

const LIST_PEEK_HEIGHT = "15%";
const LIST_EXPANDED_HEIGHT = "42%";

function ComplaintsListSheet({
  complaints,
  selectedId,
  onSelect,
  expanded,
  onToggleExpanded,
}: {
  complaints: MapComplaint[];
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
        {complaints.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-400">
            Nenhuma denúncia encontrada nesta área.
          </p>
        ) : (
          complaints.map((complaint) => (
            <ComplaintListItem
              complaint={complaint}
              isSelected={selectedId === complaint.id}
              key={complaint.id}
              onSelect={() => onSelect(complaint.id)}
            />
          ))
        )}
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

function FilterRow({
  filters,
  onOpenSheet,
}: {
  filters: FilterState;
  onOpenSheet: () => void;
}) {
  const hazard =
    filters.hazardLevel === "all" ? null : HAZARD_STYLES[filters.hazardLevel];
  const HazardIcon = hazard?.icon ?? Radiation;

  const status =
    filters.status === "ALL" ? null : STATUS_STYLES[filters.status];
  const StatusIcon = status?.icon ?? Shield;

  const radiusLabel =
    RADIUS_OPTIONS.find((option) => option.value === filters.radius)?.label ??
    `${filters.radius / 1000} km`;

  const chips = [
    { id: "hazard", icon: HazardIcon, label: hazard?.label ?? "Todos" },
    { id: "category", icon: Recycle, label: filters.categoryName ?? "Todos" },
    { id: "status", icon: StatusIcon, label: status?.label ?? "Todos" },
    { id: "radius", icon: Radar, label: radiusLabel },
  ];

  return (
    <div className="absolute inset-x-3 top-12 z-10 flex items-center gap-2">
      <div className="flex h-12 min-w-0 flex-1 items-center rounded-md border border-border bg-white px-3 shadow-sm">
        <div className="scrollbar-none flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
          {chips.map((chip) => (
            <span
              className="flex shrink-0 items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground"
              key={chip.id}
            >
              <chip.icon className="size-2.5" strokeWidth={2.5} />
              {chip.label}
            </span>
          ))}
        </div>
      </div>
      <button
        aria-label="Filtros"
        className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-md bg-lime-800 shadow-sm"
        onClick={onOpenSheet}
        type="button"
      >
        <Settings2 className="h-4.5 w-4.5 text-white" strokeWidth={2} />
      </button>
    </div>
  );
}

function FilterChip({
  selected,
  onClick,
  icon: Icon,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  icon?: typeof Recycle | null;
  label: string;
}) {
  return (
    <button
      className={cn(
        "flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-white text-muted-foreground",
      )}
      onClick={onClick}
      type="button"
    >
      {Icon ? <Icon className="size-3.5" strokeWidth={2.5} /> : null}
      {label}
    </button>
  );
}

function ComplaintFilterSheet({
  open,
  filters,
  categories,
  onFiltersChange,
  onApply,
  onClear,
  onClose,
}: {
  open: boolean;
  filters: FilterState;
  categories: { id: string; name: string }[];
  onFiltersChange: (filters: FilterState) => void;
  onApply: () => void;
  onClear: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <button
        aria-label="Fechar filtros"
        className={cn(
          "absolute inset-0 z-30 cursor-default bg-black/30 transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        type="button"
      />

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-40 flex h-[90%] flex-col rounded-t-md bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "pointer-events-none translate-y-full",
        )}
      >
        <div className="flex shrink-0 items-center justify-center pt-2.5">
          <span className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        <div className="flex shrink-0 items-center justify-between px-4 pt-2 pb-3">
          <h2 className="font-heading text-base font-semibold text-gray-900">
            Filtros
          </h2>
          <button
            aria-label="Fechar filtros"
            className="flex size-7 cursor-pointer items-center justify-center rounded-md text-gray-400"
            onClick={onClose}
            type="button"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </div>

        <div className="scrollbar-none flex-1 overflow-y-auto px-4 pb-4">
          <p className="mb-3 text-xs font-semibold text-muted-foreground">
            Categorias de resíduos
          </p>
          <div className="mb-4 flex flex-wrap gap-2">
            <FilterChip
              icon={Recycle}
              label="Todos"
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  categoryId: null,
                  categoryName: null,
                })
              }
              selected={filters.categoryId === null}
            />
            {categories.map((category) => (
              <FilterChip
                icon={Recycle}
                key={category.id}
                label={category.name}
                onClick={() =>
                  onFiltersChange(
                    filters.categoryId === category.id
                      ? { ...filters, categoryId: null, categoryName: null }
                      : {
                          ...filters,
                          categoryId: category.id,
                          categoryName: category.name,
                        },
                  )
                }
                selected={filters.categoryId === category.id}
              />
            ))}
          </div>

          <div className="mb-4 h-px bg-border" />

          <p className="mb-3 text-xs font-semibold text-muted-foreground">
            Periculosidade
          </p>
          <div className="mb-4 flex flex-wrap gap-2">
            {HAZARD_FILTER_OPTIONS.map((option) => (
              <FilterChip
                icon={option.icon}
                key={option.key}
                label={option.label}
                onClick={() =>
                  onFiltersChange({ ...filters, hazardLevel: option.key })
                }
                selected={filters.hazardLevel === option.key}
              />
            ))}
          </div>

          <div className="mb-4 h-px bg-border" />

          <p className="mb-3 text-xs font-semibold text-muted-foreground">
            Status
          </p>
          <div className="mb-4 flex flex-wrap gap-2">
            {STATUS_FILTER_OPTIONS.map((option) => (
              <FilterChip
                icon={option.icon}
                key={option.key}
                label={option.label}
                onClick={() =>
                  onFiltersChange({ ...filters, status: option.key })
                }
                selected={filters.status === option.key}
              />
            ))}
          </div>

          <div className="mb-4 h-px bg-border" />

          <p className="mb-3 text-xs font-semibold text-muted-foreground">
            Raio de busca
          </p>
          <div className="flex flex-wrap gap-2">
            {RADIUS_OPTIONS.map((option) => (
              <FilterChip
                icon={Radar}
                key={option.value}
                label={option.label}
                onClick={() =>
                  onFiltersChange({ ...filters, radius: option.value })
                }
                selected={filters.radius === option.value}
              />
            ))}
          </div>
        </div>

        <div className="flex shrink-0 gap-3 border-t border-border p-4">
          <button
            className="h-11 flex-1 cursor-pointer rounded-md border border-border bg-white text-sm font-semibold text-foreground"
            onClick={onClear}
            type="button"
          >
            Limpar
          </button>
          <button
            className="h-11 flex-1 cursor-pointer rounded-md bg-lime-800 text-sm font-semibold text-white"
            onClick={onApply}
            type="button"
          >
            Aplicar
          </button>
        </div>
      </div>
    </>
  );
}

const DATE_LABEL_FORMAT = "d 'de' MMMM 'de' yyyy 'às' HH:mm";

function ComplaintDetailSheet({
  complaint,
  onClose,
}: {
  complaint: MapComplaint | null;
  onClose: () => void;
}) {
  const { persona } = useMockIdentity();
  const complaintId = complaint?.id ?? "";
  const { currentVote, castVote, resolvedDelta, notResolvedDelta } =
    useMockVotes(complaintId, persona?.id ?? null);
  const { resolutions, addResolution } = useMockResolutions(complaintId);
  const [resolutionDraft, setResolutionDraft] = useState("");
  const open = complaint !== null;

  useEffect(() => {
    setResolutionDraft("");
  }, []);

  const status = complaint ? STATUS_STYLES[complaint.status] : null;
  const StatusIcon = status?.icon;
  const canInteract = persona !== null;
  const isResolved = complaint?.status === "RESOLVED";

  const dateLabel = complaint
    ? `${format(complaint.createdAt, DATE_LABEL_FORMAT, { locale: ptBR })} • Aberto há ${formatDistanceToNowStrict(complaint.createdAt, { locale: ptBR })}`
    : "";

  const resolvedVotes = (complaint?.voteCounts.resolved ?? 0) + resolvedDelta;
  const notResolvedVotes =
    (complaint?.voteCounts.notResolved ?? 0) + notResolvedDelta;

  const handleSubmitResolution = () => {
    if (!persona || !resolutionDraft.trim()) return;
    addResolution(persona.id, resolutionDraft.trim());
    setResolutionDraft("");
  };

  return (
    <>
      <button
        aria-label="Fechar denúncia"
        className={cn(
          "absolute inset-0 z-30 cursor-default bg-black/30 transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        type="button"
      />

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-40 flex h-[85%] flex-col rounded-t-md bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "pointer-events-none translate-y-full",
        )}
      >
        <div className="flex shrink-0 items-center justify-center pt-2.5">
          <span className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        <button
          aria-label="Fechar"
          className="absolute top-3 right-3 flex size-7 cursor-pointer items-center justify-center rounded-md text-gray-400"
          onClick={onClose}
          type="button"
        >
          <X className="size-4" strokeWidth={2} />
        </button>

        {complaint ? (
          <div className="scrollbar-none flex-1 overflow-y-auto px-4 pt-6 pb-4">
            <div className="flex flex-col gap-2">
              <span className="inline-flex w-fit items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                <Hash className="size-2.5" strokeWidth={2.5} />
                {complaint.id.slice(0, 8)}
              </span>

              <h2 className="font-heading text-xl font-bold text-gray-950">
                DESCARTE IRREGULAR
              </h2>

              <div className="scrollbar-none flex items-center gap-1.5 overflow-x-auto">
                {status && StatusIcon ? (
                  <span
                    className={cn(
                      "flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold",
                      status.classes,
                    )}
                  >
                    <StatusIcon className="size-2.5" strokeWidth={2.5} />
                    {status.label}
                  </span>
                ) : null}
                {complaint.categories.map((category) => {
                  const hazard = HAZARD_STYLES[category.hazard];
                  const HazardIcon = hazard.icon;
                  return (
                    <span
                      className={cn(
                        "flex shrink-0 items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold",
                        hazard.classes,
                      )}
                      key={category.id}
                    >
                      <HazardIcon className="size-2.5" strokeWidth={3} />
                      {category.name}
                    </span>
                  );
                })}
              </div>

              {complaint.address ? (
                <div className="flex items-center gap-1.5">
                  <MapPin
                    className="size-3 shrink-0 text-gray-400"
                    strokeWidth={2}
                  />
                  <span className="text-xs text-gray-500">
                    {complaint.address}
                  </span>
                </div>
              ) : null}

              <div className="flex items-center gap-1.5">
                <Calendar
                  className="size-3 shrink-0 text-gray-400"
                  strokeWidth={2}
                />
                <span className="text-xs text-gray-500">{dateLabel}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Crosshair
                  className="size-3 shrink-0 text-gray-400"
                  strokeWidth={2}
                />
                <span className="text-xs text-gray-500">
                  {complaint.lat.toFixed(4)}, {complaint.lon.toFixed(4)}
                </span>
              </div>

              {complaint.attachmentCount > 0 ? (
                <div className="flex items-center gap-1.5">
                  <Paperclip
                    className="size-3 shrink-0 text-gray-400"
                    strokeWidth={2}
                  />
                  <span className="text-xs text-gray-500">
                    {complaint.attachmentCount}{" "}
                    {complaint.attachmentCount === 1 ? "anexo" : "anexos"}
                  </span>
                </div>
              ) : null}

              {complaint.observations ? (
                <div className="mt-1 flex flex-col gap-1">
                  <p className="text-sm font-semibold text-gray-900">
                    Observações
                  </p>
                  <p className="text-sm leading-5 text-gray-600">
                    {complaint.observations}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="my-4 h-px bg-border" />

            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-gray-900">
                Seu voto importa!
              </p>
              <div className="flex gap-2">
                <button
                  className={cn(
                    "flex h-14 flex-1 flex-col items-center justify-center rounded-md border",
                    isResolved || !canInteract
                      ? "border-gray-100 bg-gray-50"
                      : currentVote === "NOT_RESOLVED"
                        ? "border-transparent bg-red-600"
                        : "border-border bg-white",
                  )}
                  disabled={isResolved || !canInteract}
                  onClick={() => castVote("NOT_RESOLVED")}
                  type="button"
                >
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      isResolved || !canInteract
                        ? "text-gray-300"
                        : currentVote === "NOT_RESOLVED"
                          ? "text-white"
                          : "text-gray-700",
                    )}
                  >
                    Não Resolvida
                  </span>
                  <span
                    className={cn(
                      "text-xs",
                      isResolved || !canInteract
                        ? "text-gray-300"
                        : currentVote === "NOT_RESOLVED"
                          ? "text-red-200"
                          : "text-gray-400",
                    )}
                  >
                    {notResolvedVotes} votos
                  </span>
                </button>
                <button
                  className={cn(
                    "flex h-14 flex-1 flex-col items-center justify-center rounded-md border",
                    isResolved || !canInteract
                      ? "border-gray-100 bg-gray-50"
                      : currentVote === "RESOLVED"
                        ? "border-transparent bg-lime-800"
                        : "border-border bg-white",
                  )}
                  disabled={isResolved || !canInteract}
                  onClick={() => castVote("RESOLVED")}
                  type="button"
                >
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      isResolved || !canInteract
                        ? "text-gray-300"
                        : currentVote === "RESOLVED"
                          ? "text-white"
                          : "text-gray-700",
                    )}
                  >
                    Resolvida
                  </span>
                  <span
                    className={cn(
                      "text-xs",
                      isResolved || !canInteract
                        ? "text-gray-300"
                        : currentVote === "RESOLVED"
                          ? "text-lime-200"
                          : "text-gray-400",
                    )}
                  >
                    {resolvedVotes} votos
                  </span>
                </button>
              </div>
              {!canInteract ? (
                <p className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Lock className="size-3" strokeWidth={2} />
                  Escolha uma persona no topo da página pra votar.
                </p>
              ) : null}
            </div>

            <div className="my-4 h-px bg-border" />

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900">
                  Resoluções
                </p>
                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                  {resolutions.length}
                </span>
              </div>

              {resolutions.length === 0 ? (
                <p className="py-2 text-center text-sm text-gray-400">
                  Nenhuma resolução cadastrada para esta denúncia.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {resolutions.map((resolution) => {
                    const author = PERSONAS.find(
                      (p) => p.id === resolution.personaId,
                    );
                    return (
                      <div
                        className="flex gap-2.5 rounded-md border border-border p-3"
                        key={resolution.id}
                      >
                        {author ? (
                          <div className="relative size-7 shrink-0 overflow-hidden rounded-full">
                            <Image
                              alt=""
                              className="object-cover"
                              fill
                              sizes="28px"
                              src={author.avatarSrc}
                            />
                          </div>
                        ) : null}
                        <div className="flex flex-col gap-0.5">
                          <p className="text-sm text-gray-700">
                            {resolution.description}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {author?.displayName ?? "Anônimo"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {canInteract && !isResolved ? (
                <div className="mt-1 flex flex-col gap-2">
                  <textarea
                    className="min-h-16 rounded-md border border-border p-2 text-sm"
                    onChange={(event) => setResolutionDraft(event.target.value)}
                    placeholder="Descreva como essa denúncia foi resolvida..."
                    value={resolutionDraft}
                  />
                  <button
                    className="h-10 cursor-pointer rounded-md border border-border bg-white text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:text-gray-300"
                    disabled={!resolutionDraft.trim()}
                    onClick={handleSubmitResolution}
                    type="button"
                  >
                    Adicionar resolução
                  </button>
                </div>
              ) : !canInteract ? (
                <p className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Lock className="size-3" strokeWidth={2} />
                  Escolha uma persona no topo da página pra adicionar uma
                  resolução.
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}

function ReportMapScreen() {
  const [isDarkMap, setIsDarkMap] = useState(false);
  const [showUserLocation, setShowUserLocation] = useState(true);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(
    null,
  );
  const [isListExpanded, setIsListExpanded] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] =
    useState<FilterState>(DEFAULT_FILTERS);

  const { categories } = useWasteCategories();
  const { complaints: rawComplaints } = useComplaintsMap({
    lat: CENTER[1],
    lon: CENTER[0],
    radius: appliedFilters.radius,
    status: appliedFilters.status,
    wasteCategoryId: appliedFilters.categoryId ?? "ALL",
    hazardLevel:
      appliedFilters.hazardLevel === "all"
        ? "ALL"
        : (appliedFilters.hazardLevel.toUpperCase() as ApiHazardLevel),
  });

  useSetStatusBarVariant(isDarkMap || isFilterSheetOpen ? "light" : "dark");

  const userRadiusGeoJson = useMemo(
    () => createGeoCircle(CENTER, appliedFilters.radius),
    [appliedFilters.radius],
  );

  const complaints = useMemo<MapComplaint[]>(
    () =>
      rawComplaints
        .filter((complaint) => complaint.location !== null)
        .map((complaint) => ({
          id: complaint.id,
          lat: (complaint.location as { lat: number; lon: number }).lat,
          lon: (complaint.location as { lat: number; lon: number }).lon,
          observations: complaint.observations,
          address: deriveAddress(complaint.geospatial.addresses),
          status: complaint.status,
          categories: complaint.categories.map((category) => ({
            id: category.id,
            name: category.name,
            hazard: highestHazardVariant(category.hazard_levels),
          })),
          createdAt: new Date(complaint.date),
          voteCounts: {
            resolved: complaint.vote_counts.resolved,
            notResolved: complaint.vote_counts.not_resolved,
          },
          resolutionCount: complaint.resolution_count,
          attachmentCount: complaint.attachments.length,
        })),
    [rawComplaints],
  );

  const handleSelectComplaint = useCallback((id: string) => {
    setSelectedComplaintId(id);
    setIsListExpanded(false);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedComplaintId(null);
    setIsListExpanded(true);
  }, []);

  const selectedComplaint =
    complaints.find((complaint) => complaint.id === selectedComplaintId) ??
    null;

  const handleOpenFilterSheet = useCallback(() => {
    setDraftFilters(appliedFilters);
    setIsFilterSheetOpen(true);
  }, [appliedFilters]);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(draftFilters);
    setIsFilterSheetOpen(false);
  }, [draftFilters]);

  const handleClearFilters = useCallback(() => {
    setAppliedFilters(DEFAULT_FILTERS);
    setDraftFilters(DEFAULT_FILTERS);
    setIsFilterSheetOpen(false);
  }, []);

  return (
    <div className="relative h-full w-full">
      <MapcnMap center={CENTER} theme={isDarkMap ? "dark" : "light"} zoom={13}>
        <MapGeoJSON
          data={userRadiusGeoJson}
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

        {complaints.map((complaint) => (
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

      <FilterRow filters={appliedFilters} onOpenSheet={handleOpenFilterSheet} />

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
        complaints={complaints}
        expanded={isListExpanded}
        onSelect={handleSelectComplaint}
        onToggleExpanded={() => setIsListExpanded((v) => !v)}
        selectedId={selectedComplaintId}
      />

      <ComplaintFilterSheet
        categories={categories}
        filters={draftFilters}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        onClose={() => setIsFilterSheetOpen(false)}
        onFiltersChange={setDraftFilters}
        open={isFilterSheetOpen}
      />

      <ComplaintDetailSheet
        complaint={selectedComplaint}
        onClose={handleCloseDetail}
      />
    </div>
  );
}

export { ReportMapScreen };
