"use client";

import { useQuery } from "@tanstack/react-query";

import { getWasteCategoriesAction } from "@/app/(public)/(institutional)/device-preview/actions";

export function useWasteCategories() {
  const query = useQuery({
    queryKey: ["waste-categories"],
    queryFn: getWasteCategoriesAction,
  });

  return {
    categories: query.data ?? [],
    isLoading: query.isLoading,
  };
}
