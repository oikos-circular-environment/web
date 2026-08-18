import { create } from "zustand";

export type GeolocationPermissionState =
  | "idle"
  | "prompt"
  | "granted"
  | "denied"
  | "unsupported";

export type GeolocationCoordinatesSnapshot = {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
};

export type ReverseGeocodedAddress = {
  street: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  postcode: string | null;
  country: string | null;
};

type GeolocationStatus = "idle" | "loading" | "success" | "error";

type AddressStatus = "idle" | "loading" | "success" | "error";

type GeolocationErrorCode =
  | "PERMISSION_DENIED"
  | "POSITION_UNAVAILABLE"
  | "TIMEOUT"
  | "UNSUPPORTED";

type GeolocationState = {
  status: GeolocationStatus;
  permission: GeolocationPermissionState;
  coordinates: GeolocationCoordinatesSnapshot | null;
  timestamp: number | null;
  errorCode: GeolocationErrorCode | null;
  errorMessage: string | null;
  address: ReverseGeocodedAddress | null;
  addressStatus: AddressStatus;
  checkPermission: () => Promise<GeolocationPermissionState>;
  requestLocation: () => Promise<void>;
};

function toCoordinates(
  coords: GeolocationCoordinatesSnapshot,
): GeolocationCoordinatesSnapshot {
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy,
    altitude: coords.altitude,
    altitudeAccuracy: coords.altitudeAccuracy,
    heading: coords.heading,
    speed: coords.speed,
  };
}

function mapGeolocationError(error: GeolocationPositionError): {
  code: GeolocationErrorCode;
  message: string;
} {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return {
        code: "PERMISSION_DENIED",
        message: "Permissão de localização negada.",
      };
    case error.POSITION_UNAVAILABLE:
      return {
        code: "POSITION_UNAVAILABLE",
        message: "Não foi possível determinar sua localização.",
      };
    case error.TIMEOUT:
      return {
        code: "TIMEOUT",
        message: "Tempo esgotado ao tentar obter sua localização.",
      };
    default:
      return {
        code: "POSITION_UNAVAILABLE",
        message: "Não foi possível determinar sua localização.",
      };
  }
}

async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<ReverseGeocodedAddress | null> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", String(latitude));
    url.searchParams.set("lon", String(longitude));
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("accept-language", "pt-BR");

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;

    const data = await response.json();
    const address = data?.address ?? {};

    return {
      street: address.road ?? null,
      neighborhood: address.suburb ?? address.neighbourhood ?? null,
      city: address.city ?? address.town ?? address.municipality ?? null,
      state: address.state ?? null,
      postcode: address.postcode ?? null,
      country: address.country ?? null,
    };
  } catch {
    return null;
  }
}

export const useGeolocationStore = create<GeolocationState>()((set) => ({
  status: "idle",
  permission: "idle",
  coordinates: null,
  timestamp: null,
  errorCode: null,
  errorMessage: null,
  address: null,
  addressStatus: "idle",

  checkPermission: async () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      set({ permission: "unsupported" });
      return "unsupported";
    }

    if (!navigator.permissions?.query) {
      set({ permission: "prompt" });
      return "prompt";
    }

    try {
      const result = await navigator.permissions.query({
        name: "geolocation",
      });
      set({ permission: result.state });
      return result.state;
    } catch {
      set({ permission: "prompt" });
      return "prompt";
    }
  },

  requestLocation: async () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      set({
        status: "error",
        permission: "unsupported",
        errorCode: "UNSUPPORTED",
        errorMessage: "Geolocalização não é suportada neste navegador.",
      });
      return;
    }

    set({ status: "loading", errorCode: null, errorMessage: null });

    const position = await new Promise<GeolocationPosition | null>(
      (resolve) => {
        navigator.geolocation.getCurrentPosition(
          (result) => resolve(result),
          (error) => {
            const mapped = mapGeolocationError(error);
            set({
              status: "error",
              permission:
                error.code === error.PERMISSION_DENIED ? "denied" : "prompt",
              errorCode: mapped.code,
              errorMessage: mapped.message,
            });
            resolve(null);
          },
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 },
        );
      },
    );

    if (!position) return;

    const coordinates = toCoordinates(position.coords);
    set({
      status: "success",
      permission: "granted",
      coordinates,
      timestamp: position.timestamp,
      errorCode: null,
      errorMessage: null,
      addressStatus: "loading",
      address: null,
    });

    const address = await reverseGeocode(
      coordinates.latitude,
      coordinates.longitude,
    );
    set({ address, addressStatus: address ? "success" : "error" });
  },
}));
