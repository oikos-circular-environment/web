"use client";

import { format, formatDistanceToNowStrict } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertCircle,
  Calendar,
  Camera,
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
  Play,
  Plus,
  Radar,
  Radiation,
  Recycle,
  Settings2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Sun,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import {
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
import { compressImageFile } from "../mock-identity/compress-image-file";
import { useMockIdentity } from "../mock-identity/mock-identity-context";
import { PERSONAS } from "../mock-identity/personas";
import { useMockComplaints } from "../mock-identity/use-mock-complaints";
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
  attachments: { id: string; url: string; type: "PHOTO" | "VIDEO" }[];
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

/** Anexos vêm de storage externo (API) ou de fotos comprimidas em localStorage — cai pro logo se a imagem não carregar. */
function AttachmentImage({
  src,
  alt,
  sizes,
}: {
  src: string;
  alt: string;
  sizes: string;
}) {
  const [errored, setErrored] = useState(false);

  return (
    <Image
      alt={alt}
      className={errored ? "object-contain p-3 opacity-40" : "object-cover"}
      fill
      onError={() => setErrored(true)}
      sizes={sizes}
      src={errored ? "/oikos-logo.png" : src}
      unoptimized
    />
  );
}

const VOTE_BUTTON_STYLES = {
  NOT_RESOLVED: {
    label: "Não Resolvida",
    icon: ThumbsDown,
    activeClasses: "border-transparent bg-red-600",
    activeTextClasses: "text-white",
    activeCountClasses: "text-red-200",
  },
  RESOLVED: {
    label: "Resolvida",
    icon: ThumbsUp,
    activeClasses: "border-transparent bg-lime-800",
    activeTextClasses: "text-white",
    activeCountClasses: "text-lime-200",
  },
} as const;

function ComplaintVoteButton({
  type,
  count,
  active,
  disabled,
  onClick,
}: {
  type: "RESOLVED" | "NOT_RESOLVED";
  count: number;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const config = VOTE_BUTTON_STYLES[type];
  const Icon = config.icon;

  const textClasses = disabled
    ? "text-gray-300"
    : active
      ? config.activeTextClasses
      : "text-gray-700";
  const countClasses = disabled
    ? "text-gray-300"
    : active
      ? config.activeCountClasses
      : "text-gray-400";
  const iconClasses = disabled
    ? "text-gray-300"
    : active
      ? config.activeTextClasses
      : "text-gray-400";

  return (
    <button
      className={cn(
        "flex h-14 flex-1 cursor-pointer items-center gap-3 rounded-md border px-4 disabled:cursor-not-allowed",
        type === "RESOLVED" && "flex-row-reverse",
        disabled
          ? "border-gray-100 bg-gray-50"
          : active
            ? config.activeClasses
            : "border-border bg-white",
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <Icon className={cn("size-4 shrink-0", iconClasses)} strokeWidth={2} />
      <span className="flex flex-1 flex-col items-center">
        <span className={cn("text-xs font-semibold", textClasses)}>
          {config.label}
        </span>
        <span className={cn("text-xs", countClasses)}>{count} votos</span>
      </span>
    </button>
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
        <div className="flex flex-1 justify-between items-center">
          <p className="truncate text-sm font-bold text-gray-900">
            DESCARTE IRREGULAR
          </p>
          <span className="inline-flex w-fit items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
            <Hash className="size-2.5" strokeWidth={2.5} />
            {complaint.id.slice(0, 8)}
          </span>
        </div>

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
        <button
          aria-label="Fechar filtros"
          className="flex shrink-0 cursor-pointer items-center justify-center py-2.5"
          onClick={onClose}
          type="button"
        >
          <span className="h-1 w-10 rounded-full bg-gray-300" />
        </button>

        <div className="flex shrink-0 items-center px-4 pt-2 pb-3">
          <h2 className="font-heading text-base font-semibold text-gray-900">
            Filtros
          </h2>
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
  const [resolutionPhotos, setResolutionPhotos] = useState<string[]>([]);
  const [isCompressingResolutionPhoto, setIsCompressingResolutionPhoto] =
    useState(false);
  const [isDraggingResolutionPhoto, setIsDraggingResolutionPhoto] =
    useState(false);
  const resolutionFileInputRef = useRef<HTMLInputElement>(null);
  const open = complaint !== null;

  useEffect(() => {
    setResolutionDraft("");
    setResolutionPhotos([]);
  }, []);

  const addResolutionPhotoFiles = useCallback(async (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    setIsCompressingResolutionPhoto(true);
    try {
      const dataUrls = await Promise.all(
        imageFiles.map((file) => compressImageFile(file)),
      );
      setResolutionPhotos((current) => [...current, ...dataUrls]);
    } finally {
      setIsCompressingResolutionPhoto(false);
    }
  }, []);

  const handleResolutionFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length > 0) addResolutionPhotoFiles(files);
  };

  const handleResolutionPhotoDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDraggingResolutionPhoto(false);
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      addResolutionPhotoFiles(files);
    }
  };

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
    addResolution(persona.id, resolutionDraft.trim(), resolutionPhotos);
    setResolutionDraft("");
    setResolutionPhotos([]);
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
        <button
          aria-label="Fechar denúncia"
          className="flex shrink-0 cursor-pointer items-center justify-center py-2.5"
          onClick={onClose}
          type="button"
        >
          <span className="h-1 w-10 rounded-full bg-gray-300" />
        </button>

        {complaint ? (
          <div className="scrollbar-none flex-1 overflow-y-auto px-4 pt-6 pb-4">
            <div className="flex flex-col gap-2">
              <div className="flex flex-1 justify-between items-center">
                <p className="truncate text-xl font-bold text-gray-900">
                  DESCARTE IRREGULAR
                </p>
                <span className="inline-flex w-fit items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  <Hash className="size-2.5" strokeWidth={2.5} />
                  {complaint.id.slice(0, 8)}
                </span>
              </div>

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

              {complaint.attachments.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <Paperclip
                      className="size-3 shrink-0 text-gray-400"
                      strokeWidth={2}
                    />
                    <span className="text-xs text-gray-500">
                      {complaint.attachments.length}{" "}
                      {complaint.attachments.length === 1 ? "anexo" : "anexos"}
                    </span>
                  </div>
                  <div className="scrollbar-none flex gap-2 overflow-x-auto">
                    {complaint.attachments.map((attachment) => (
                      <div
                        className="relative size-20 shrink-0 overflow-hidden rounded-md bg-gray-100"
                        key={attachment.id}
                      >
                        <AttachmentImage
                          alt=""
                          sizes="80px"
                          src={attachment.url}
                        />
                        {attachment.type === "VIDEO" ? (
                          <div className="absolute right-1 bottom-1 flex items-center justify-center rounded-full bg-black/60 p-1">
                            <Play
                              className="size-2.5 fill-white text-white"
                              strokeWidth={0}
                            />
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
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
                <ComplaintVoteButton
                  active={currentVote === "NOT_RESOLVED"}
                  count={notResolvedVotes}
                  disabled={isResolved || !canInteract}
                  onClick={() => castVote("NOT_RESOLVED")}
                  type="NOT_RESOLVED"
                />
                <ComplaintVoteButton
                  active={currentVote === "RESOLVED"}
                  count={resolvedVotes}
                  disabled={isResolved || !canInteract}
                  onClick={() => castVote("RESOLVED")}
                  type="RESOLVED"
                />
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
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <p className="text-sm text-gray-700">
                            {resolution.description}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {author?.displayName ?? "Anônimo"}
                          </p>
                          {resolution.attachments.length > 0 ? (
                            <div className="scrollbar-none flex gap-1.5 overflow-x-auto pt-1">
                              {resolution.attachments.map((url) => (
                                <div
                                  className="relative size-14 shrink-0 overflow-hidden rounded-md bg-gray-100"
                                  key={url}
                                >
                                  <AttachmentImage
                                    alt=""
                                    sizes="56px"
                                    src={url}
                                  />
                                </div>
                              ))}
                            </div>
                          ) : null}
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

                  <input
                    accept="image/*"
                    className="hidden"
                    multiple
                    onChange={handleResolutionFileChange}
                    ref={resolutionFileInputRef}
                    type="file"
                  />

                  {resolutionPhotos.length > 0 ? (
                    <div className="scrollbar-none flex gap-2 overflow-x-auto">
                      {resolutionPhotos.map((url, index) => (
                        <div
                          className="relative size-16 shrink-0 overflow-hidden rounded-md"
                          key={url}
                        >
                          <Image
                            alt=""
                            className="object-cover"
                            fill
                            sizes="64px"
                            src={url}
                          />
                          <button
                            aria-label="Remover foto"
                            className="absolute top-1 right-1 flex size-5 cursor-pointer items-center justify-center rounded-full bg-black/60"
                            onClick={() =>
                              setResolutionPhotos((current) =>
                                current.filter((_, i) => i !== index),
                              )
                            }
                            type="button"
                          >
                            <X
                              className="size-3 text-white"
                              strokeWidth={2.5}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <button
                    className={cn(
                      "flex h-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed text-xs font-medium text-gray-500 disabled:cursor-not-allowed disabled:text-gray-300",
                      isDraggingResolutionPhoto
                        ? "border-primary bg-muted"
                        : "border-border",
                    )}
                    disabled={isCompressingResolutionPhoto}
                    onClick={() => resolutionFileInputRef.current?.click()}
                    onDragLeave={() => setIsDraggingResolutionPhoto(false)}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setIsDraggingResolutionPhoto(true);
                    }}
                    onDrop={handleResolutionPhotoDrop}
                    type="button"
                  >
                    <Camera className="size-4" strokeWidth={2} />
                    {isCompressingResolutionPhoto
                      ? "Processando..."
                      : "Arraste fotos aqui ou clique para escolher"}
                  </button>

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

function CreateComplaintSheet({
  open,
  categories,
  onClose,
  onSubmit,
}: {
  open: boolean;
  categories: { id: string; name: string; hazard_levels: ApiHazardLevel[] }[];
  onClose: () => void;
  onSubmit: (input: {
    observations: string | null;
    categoryIds: string[];
    photoDataUrl: string | null;
  }) => void;
}) {
  const { persona } = useMockIdentity();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [observations, setObservations] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) return;
    setSelectedCategoryIds([]);
    setObservations("");
    setPhotoDataUrl(null);
    setError(null);
  }, [open]);

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((current) =>
      current.includes(id) ? current.filter((c) => c !== id) : [...current, id],
    );
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsCompressing(true);
    try {
      const dataUrl = await compressImageFile(file);
      setPhotoDataUrl(dataUrl);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = () => {
    if (!photoDataUrl) {
      setError("Adicione ao menos uma foto.");
      return;
    }
    if (selectedCategoryIds.length === 0) {
      setError("Selecione ao menos uma categoria.");
      return;
    }
    setError(null);
    onSubmit({
      observations: observations.trim() || null,
      categoryIds: selectedCategoryIds,
      photoDataUrl,
    });
  };

  return (
    <>
      <button
        aria-label="Fechar nova denúncia"
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
        <button
          aria-label="Fechar nova denúncia"
          className="flex shrink-0 cursor-pointer items-center justify-center py-2.5"
          onClick={onClose}
          type="button"
        >
          <span className="h-1 w-10 rounded-full bg-gray-300" />
        </button>

        <div className="flex shrink-0 items-center px-4 pt-2 pb-3">
          <h2 className="font-heading text-base font-semibold text-gray-900">
            Nova denúncia
          </h2>
        </div>

        {persona ? (
          <div className="scrollbar-none flex-1 overflow-y-auto px-4 pb-4">
            <div className="flex items-start gap-3 rounded-md bg-muted p-3">
              <ShieldAlert
                className="size-4 shrink-0 text-primary"
                strokeWidth={2.2}
              />
              <p className="text-xs text-muted-foreground">
                Registre denúncias de descarte irregular informando o local e
                anexando uma foto como evidência.
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-1">
              <p className="text-sm font-semibold text-gray-900">Localização</p>
              <div className="flex items-center gap-1.5">
                <MapPin
                  className="size-3 shrink-0 text-gray-400"
                  strokeWidth={2}
                />
                <span className="text-xs text-gray-500">
                  {persona.address.street}, {persona.address.number} —{" "}
                  {persona.address.district}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Usando o endereço do seu perfil simulado.
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <p className="text-sm font-semibold text-gray-900">
                Categorias identificadas
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <FilterChip
                    icon={Recycle}
                    key={category.id}
                    label={category.name}
                    onClick={() => toggleCategory(category.id)}
                    selected={selectedCategoryIds.includes(category.id)}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <p className="text-sm font-semibold text-gray-900">
                Foto do local
              </p>
              <input
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                ref={fileInputRef}
                type="file"
              />
              {photoDataUrl ? (
                <div className="relative size-24 overflow-hidden rounded-md">
                  <Image
                    alt=""
                    className="object-cover"
                    fill
                    sizes="96px"
                    src={photoDataUrl}
                  />
                  <button
                    aria-label="Remover foto"
                    className="absolute top-1 right-1 flex size-5 cursor-pointer items-center justify-center rounded-full bg-black/60"
                    onClick={() => setPhotoDataUrl(null)}
                    type="button"
                  >
                    <X className="size-3 text-white" strokeWidth={2.5} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    className="flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-border text-sm font-medium text-gray-700 disabled:text-gray-300"
                    disabled={isCompressing}
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                  >
                    <Camera className="size-4" strokeWidth={2} />
                    {isCompressing ? "Processando..." : "Escolher foto"}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <p className="text-sm font-semibold text-gray-900">Observações</p>
              <textarea
                className="min-h-20 rounded-md border border-border p-2 text-sm"
                maxLength={500}
                onChange={(event) => setObservations(event.target.value)}
                placeholder="Descreva o ocorrido com detalhes relevantes..."
                value={observations}
              />
            </div>

            {error ? (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-red-600">
                <AlertCircle className="size-3" strokeWidth={2} />
                {error}
              </p>
            ) : null}

            <div className="mt-4 flex gap-3">
              <button
                className="h-11 flex-1 cursor-pointer rounded-md border border-border bg-white text-sm font-semibold text-gray-700"
                onClick={onClose}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="h-11 flex-1 cursor-pointer rounded-md bg-lime-800 text-sm font-semibold text-white"
                onClick={handleSubmit}
                type="button"
              >
                Enviar denúncia
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
            <Lock className="size-5 text-gray-400" strokeWidth={2} />
            <p className="text-sm text-gray-500">
              Escolha uma persona no topo da página pra registrar uma denúncia.
            </p>
          </div>
        )}
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
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] =
    useState<FilterState>(DEFAULT_FILTERS);

  const { persona } = useMockIdentity();
  const { categories } = useWasteCategories();
  const { complaints: mockComplaints, addComplaint } = useMockComplaints();
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

  const complaints = useMemo<MapComplaint[]>(() => {
    const fromApi = rawComplaints
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
        attachments: complaint.attachments.map((attachment) => ({
          id: attachment.id,
          url: attachment.url,
          type: attachment.type,
        })),
      }));

    const fromMock = mockComplaints.map((complaint) => ({
      id: complaint.id,
      lat: complaint.lat,
      lon: complaint.lon,
      observations: complaint.observations,
      address: complaint.address,
      status: "OPEN" as const,
      categories: complaint.categoryIds
        .map((id) => categories.find((category) => category.id === id))
        .filter((category) => category !== undefined)
        .map((category) => ({
          id: category.id,
          name: category.name,
          hazard: highestHazardVariant(category.hazard_levels),
        })),
      createdAt: new Date(complaint.createdAt),
      voteCounts: { resolved: 0, notResolved: 0 },
      resolutionCount: 0,
      attachments: complaint.photoDataUrl
        ? [
            {
              id: `${complaint.id}-photo`,
              url: complaint.photoDataUrl,
              type: "PHOTO" as const,
            },
          ]
        : [],
    }));

    return [...fromMock, ...fromApi];
  }, [rawComplaints, mockComplaints, categories]);

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

  const handleSubmitComplaint = useCallback(
    (input: {
      observations: string | null;
      categoryIds: string[];
      photoDataUrl: string | null;
    }) => {
      if (!persona) return;
      const created = addComplaint({
        authorPersonaId: persona.id,
        observations: input.observations,
        categoryIds: input.categoryIds,
        photoDataUrl: input.photoDataUrl,
        lat: persona.address.latitude,
        lon: persona.address.longitude,
        address: `${persona.address.street}, ${persona.address.number} — ${persona.address.district}`,
      });
      setIsCreateSheetOpen(false);
      setSelectedComplaintId(created.id);
      setIsListExpanded(false);
    },
    [persona, addComplaint],
  );

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
          className="flex h-12.5 w-12.5 cursor-pointer items-center justify-center rounded-md bg-lime-800 shadow-md"
          onClick={() => setIsCreateSheetOpen(true)}
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

      <CreateComplaintSheet
        categories={categories}
        onClose={() => setIsCreateSheetOpen(false)}
        onSubmit={handleSubmitComplaint}
        open={isCreateSheetOpen}
      />
    </div>
  );
}

export { ReportMapScreen };
