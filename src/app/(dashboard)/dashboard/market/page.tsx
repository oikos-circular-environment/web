import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_RADIUS,
  PAGE_LIMIT,
} from "@/contexts/market-context";
import { MarketPageClient } from "./_components/market-page-client";
import { getMarketAction } from "./actions";

export default async function MarketPage() {
  const initialData = await getMarketAction({
    lat: DEFAULT_LATITUDE,
    lon: DEFAULT_LONGITUDE,
    radius: DEFAULT_RADIUS * 1000,
    limit: PAGE_LIMIT,
  });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold">
          Pontos de Coleta
        </h1>
        <p className="text-sm text-muted-foreground">
          Encontre empresas, coletores e serviços próximos a você.
        </p>
      </div>
      <MarketPageClient initialData={initialData} />
    </div>
  );
}
