"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { getMarketAction } from "@/app/(public)/(institutional)/device-preview/actions";

type MarketCategory = "waste" | "services" | null;

type MarketCompany = Awaited<
  ReturnType<typeof getMarketAction>
>["companies"][number];

type UseMarketParams = {
  lat: number;
  lon: number;
  radius: number;
  query: string | null;
  category: MarketCategory;
};

function useMarket(params: UseMarketParams) {
  const query = useInfiniteQuery({
    queryKey: ["market", params],
    queryFn: ({ pageParam }) =>
      getMarketAction({ ...params, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  return {
    companies: query.data?.pages.flatMap((page) => page.companies) ?? [],
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
  };
}

export type { MarketCategory, MarketCompany };
export { useMarket };
