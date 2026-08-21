"use server";

import { apiClient } from "@/libs/api/oikos-api";
import { getV1WasteCategories } from "@/libs/oikos-sdk";

export async function getWasteCategoriesAction() {
  const { data, error } = await getV1WasteCategories({ client: apiClient });

  if (error || !data) return [];
  return data.categories;
}
