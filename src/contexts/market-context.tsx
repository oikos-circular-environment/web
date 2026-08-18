"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { z } from "zod";

import { useProfileAddress } from "@/components/profile/hooks/use-profile-address";
import {
  type ReverseGeocodedAddress,
  useGeolocationStore,
} from "@/stores/use-geolocation-store";

export const DEFAULT_LATITUDE = -23.5505;
export const DEFAULT_LONGITUDE = -46.6333;
export const DEFAULT_RADIUS = 50;
export const PAGE_LIMIT = 10;

export type LocationSource = "profile" | "browser";

const marketFiltersSchema = z.object({
  query: z
    .string()
    .trim()
    .max(100, "A busca deve ter no máximo 100 caracteres."),
  radius: z.number().min(1).max(500).default(DEFAULT_RADIUS),
  category: z.enum(["services", "waste", ""]).default(""),
});

export type MarketFilters = z.infer<typeof marketFiltersSchema>;

function formatAddressLine(address: ReverseGeocodedAddress): string | null {
  const parts = [
    address.street,
    address.neighborhood,
    address.city,
    address.state,
    address.postcode ? `CEP ${address.postcode}` : null,
    address.country,
  ].filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join(", ") : null;
}

type MarketContextValue = {
  filters: MarketFilters;
  latitude: number;
  longitude: number;
  isLocating: boolean;
  locationError: string | null;
  locationSource: LocationSource;
  hasProfileAddress: boolean;
  profileAddressLabel: string | null;
  browserAddressLabel: string | null;
  isResolvingBrowserAddress: boolean;
  setQuery: (query: string) => void;
  setRadius: (radius: number) => void;
  setCategory: (category: MarketFilters["category"]) => void;
  setLocationSource: (source: LocationSource) => void;
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
  const [locationSource, setLocationSourceState] =
    useState<LocationSource>("browser");
  const [hasChosenSource, setHasChosenSource] = useState(false);

  const geolocationStatus = useGeolocationStore((state) => state.status);
  const geolocationCoordinates = useGeolocationStore(
    (state) => state.coordinates,
  );
  const geolocationErrorMessage = useGeolocationStore(
    (state) => state.errorMessage,
  );
  const requestGeolocation = useGeolocationStore(
    (state) => state.requestLocation,
  );
  const geolocationAddress = useGeolocationStore((state) => state.address);
  const geolocationAddressStatus = useGeolocationStore(
    (state) => state.addressStatus,
  );
  const { address: profileAddress, isLoading: isProfileAddressLoading } =
    useProfileAddress();

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
    requestGeolocation();
  }, [requestGeolocation]);

  const setLocationSource = useCallback(
    (source: LocationSource) => {
      setHasChosenSource(true);
      setLocationSourceState(source);
      if (source === "browser" && !geolocationCoordinates) {
        requestGeolocation();
      }
    },
    [geolocationCoordinates, requestGeolocation],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: requestGeolocation is a stable zustand action reference.
  useEffect(() => {
    if (hasChosenSource || isProfileAddressLoading) return;

    if (profileAddress) {
      setLocationSourceState("profile");
    } else {
      setLocationSourceState("browser");
      requestGeolocation();
    }
  }, [isProfileAddressLoading, profileAddress, hasChosenSource]);

  const { latitude, longitude } = useMemo(() => {
    if (locationSource === "profile" && profileAddress) {
      return {
        latitude: profileAddress.latitude,
        longitude: profileAddress.longitude,
      };
    }
    if (geolocationCoordinates) {
      return {
        latitude: geolocationCoordinates.latitude,
        longitude: geolocationCoordinates.longitude,
      };
    }
    return { latitude: DEFAULT_LATITUDE, longitude: DEFAULT_LONGITUDE };
  }, [locationSource, profileAddress, geolocationCoordinates]);

  const isLocating =
    (locationSource === "browser" && geolocationStatus === "loading") ||
    (!hasChosenSource && isProfileAddressLoading);

  const locationError =
    locationSource === "browser" && geolocationStatus === "error"
      ? geolocationErrorMessage
      : null;

  const profileAddressLabel = profileAddress
    ? `${profileAddress.street}, ${profileAddress.number} — ${profileAddress.city}/${profileAddress.state_code}`
    : null;

  const browserAddressLabel = geolocationAddress
    ? formatAddressLine(geolocationAddress)
    : null;

  const isResolvingBrowserAddress = geolocationAddressStatus === "loading";

  return (
    <MarketContext.Provider
      value={{
        filters,
        latitude,
        longitude,
        isLocating,
        locationError,
        locationSource,
        hasProfileAddress: Boolean(profileAddress),
        profileAddressLabel,
        browserAddressLabel,
        isResolvingBrowserAddress,
        setQuery,
        setRadius,
        setCategory,
        setLocationSource,
        requestLocation,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
}
