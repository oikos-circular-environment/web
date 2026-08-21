"use server";

import { apiClient } from "@/libs/api/oikos-api";
import { getV1ComplaintsMap, getV1WasteCategories } from "@/libs/oikos-sdk";

export async function getWasteCategoriesAction() {
  const { data, error } = await getV1WasteCategories({ client: apiClient });

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
    client: apiClient,
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
