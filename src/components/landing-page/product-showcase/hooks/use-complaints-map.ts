"use client";

import { useQuery } from "@tanstack/react-query";

import { getComplaintsMapAction } from "@/app/(public)/(institutional)/device-preview/actions";

type UseComplaintsMapParams = {
  lat: number;
  lon: number;
  radius: number;
  status: "ALL" | "OPEN" | "RESOLVED";
  wasteCategoryId: string;
  hazardLevel: "ALL" | "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
};

export function useComplaintsMap(params: UseComplaintsMapParams) {
  const query = useQuery({
    queryKey: ["complaints-map", params],
    queryFn: () => getComplaintsMapAction(params),
  });

  return {
    complaints: query.data ?? [],
    isLoading: query.isLoading,
  };
}
