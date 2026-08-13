"use client";

import { MarketProvider } from "@/contexts/market-context";

import { MarketFilters } from "./market-filters";
import { MarketList } from "./market-list";

type MarketPageClientProps = {
  initialData?: Awaited<
    ReturnType<typeof import("../actions").getMarketAction>
  >;
};

export function MarketPageClient({ initialData }: MarketPageClientProps) {
  return (
    <MarketProvider>
      <div className="flex flex-col gap-6">
        <MarketFilters />
        <MarketList initialData={initialData} />
      </div>
    </MarketProvider>
  );
}
