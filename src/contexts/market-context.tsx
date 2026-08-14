"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { z } from "zod";

export const DEFAULT_LATITUDE = -23.5505;
export const DEFAULT_LONGITUDE = -46.6333;
export const DEFAULT_RADIUS = 50;
export const PAGE_LIMIT = 10;

const marketFiltersSchema = z.object({
  query: z
    .string()
    .trim()
    .max(100, "A busca deve ter no máximo 100 caracteres."),
  radius: z.number().min(1).max(500).default(DEFAULT_RADIUS),
  category: z.enum(["services", "waste", ""]).default(""),
});

export type MarketFilters = z.infer<typeof marketFiltersSchema>;

type MarketContextValue = {
  filters: MarketFilters;
  latitude: number;
  longitude: number;
  isLocating: boolean;
  locationError: string | null;
  setQuery: (query: string) => void;
  setRadius: (radius: number) => void;
  setCategory: (category: MarketFilters["category"]) => void;
  requestLocation: () => void;
};

const MarketContext = createContext<MarketContextValue | null>(null);

export function useMarketContext() {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error("useMarketContext must be used within a MarketProvider");
  }
  return context;
}

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<MarketFilters>(() =>
    marketFiltersSchema.parse({
      query: "",
      radius: DEFAULT_RADIUS,
      category: "",
    }),
  );
  const [latitude, setLatitude] = useState(DEFAULT_LATITUDE);
  const [longitude, setLongitude] = useState(DEFAULT_LONGITUDE);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const setQuery = useCallback((query: string) => {
    setFilters((current) => marketFiltersSchema.parse({ ...current, query }));
  }, []);

  const setRadius = useCallback((radius: number) => {
    setFilters((current) => marketFiltersSchema.parse({ ...current, radius }));
  }, []);

  const setCategory = useCallback((category: MarketFilters["category"]) => {
    setFilters((current) =>
      marketFiltersSchema.parse({ ...current, category }),
    );
  }, []);

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationError("Geolocalização não disponível neste navegador.");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setIsLocating(false);
      },
      () => {
        setLocationError(
          "Não foi possível obter sua localização. Usando localização padrão.",
        );
        setIsLocating(false);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 },
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return (
    <MarketContext.Provider
      value={{
        filters,
        latitude,
        longitude,
        isLocating,
        locationError,
        setQuery,
        setRadius,
        setCategory,
        requestLocation,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
}
