"use server";

import {
  getV1ComplaintsMap,
  getV1Market,
  getV1WasteCategories,
} from "@oikos-circular-environment/oikos-sdk";
import { createServerApiClient } from "@/libs/api/oikos-api";

export async function getWasteCategoriesAction() {
  const { data, error } = await getV1WasteCategories({
    client: createServerApiClient(),
  });

  if (error || !data) return [];
  return data.categories;
}

export async function getComplaintsMapAction(params: {
  lat: number;
  lon: number;
  radius: number;
  status: "ALL" | "OPEN" | "RESOLVED";
  wasteCategoryId: string;
  hazardLevel: "ALL" | "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
}) {
  const { data, error } = await getV1ComplaintsMap({
    client: createServerApiClient(),
    query: {
      lat: params.lat,
      lon: params.lon,
      radius: params.radius,
      status: params.status,
      waste_category_id: params.wasteCategoryId,
      hazard_level: params.hazardLevel,
    },
  });

  if (error || !data) return [];
  return data.complaints;
}

export async function getMarketAction(params: {
  lat: number;
  lon: number;
  radius: number;
  query: string | null;
  category: "waste" | "services" | null;
  cursor: string | null;
}) {
  const { data, error } = await getV1Market({
    client: createServerApiClient(),
    query: {
      lat: params.lat,
      lon: params.lon,
      radius: params.radius,
      q: params.query ?? undefined,
      category: params.category ?? undefined,
      cursor: params.cursor ?? undefined,
      limit: 20,
    },
  });

  if (error || !data) return { companies: [], nextCursor: null };
  return { companies: data.companies, nextCursor: data.next_cursor };
}
