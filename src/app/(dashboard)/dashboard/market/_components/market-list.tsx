"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { MapPinIcon, SearchXIcon } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

import { getMarketAction } from "@/app/(dashboard)/dashboard/market/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  PAGE_LIMIT,
  useMarketContext,
} from "@/contexts/market-context";

const marketQueryKey = "market";

type MarketListProps = {
  initialData?: Awaited<ReturnType<typeof getMarketAction>>;
};

function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function MarketCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-3/5" />
        <Skeleton className="h-4 w-2/5" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </CardContent>
    </Card>
  );
}

export function MarketList({ initialData }: MarketListProps) {
  const {
    filters,
    latitude,
    longitude,
    isLocating,
    locationError,
    requestLocation,
  } = useMarketContext();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: [
      marketQueryKey,
      latitude,
      longitude,
      filters.radius,
      filters.query,
      filters.category,
    ],
    queryFn: async ({ pageParam }) => {
      const response = await getMarketAction({
        lat: latitude ?? DEFAULT_LATITUDE,
        lon: longitude ?? DEFAULT_LONGITUDE,
        radius: filters.radius * 1000,
        q: filters.query || undefined,
        category: filters.category || undefined,
        cursor: pageParam,
        limit: PAGE_LIMIT,
      });
      return response;
    },
    initialData: initialData
      ? {
          pages: [initialData],
          pageParams: [undefined],
        }
      : undefined,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage?.next_cursor ?? undefined,
  });

  useEffect(() => {
    if (locationError) {
      toast.info(locationError);
    }
  }, [locationError]);

  const companies = data?.pages.flatMap((page) => page?.companies ?? []) ?? [];

  if (isLoading || isLocating) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from(
          { length: PAGE_LIMIT },
          (_, index) => `skeleton-${index}`,
        ).map((key) => (
          <MarketCardSkeleton key={key} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon className="text-destructive" />
          </EmptyMedia>
          <EmptyTitle>Erro ao carregar o market</EmptyTitle>
          <EmptyDescription>
            {error instanceof Error
              ? error.message
              : "Não foi possível carregar as empresas. Tente novamente."}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  if (companies.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon className="text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>Nenhuma empresa encontrada</EmptyTitle>
          <EmptyDescription>
            Tente ajustar os filtros ou sua localização para encontrar empresas
            próximas a você.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={requestLocation} disabled={isLocating}>
            <MapPinIcon />
            Usar minha localização
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {companies.map((company) => (
        <Card key={company.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{company.business_name}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {company.distance_in_meters !== undefined
                ? formatDistance(company.distance_in_meters)
                : null}
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {company.address.street}, {company.address.number} —{" "}
              {company.address.district}, {company.address.city} -{" "}
              {company.address.state_code}
            </p>
            {company.phones.length > 0 && (
              <p className="text-sm">{company.phones.join(", ")}</p>
            )}
          </CardContent>
        </Card>
      ))}

      {hasNextPage && (
        <Button
          variant="outline"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="w-full"
        >
          {isFetchingNextPage ? "Carregando..." : "Carregar mais"}
        </Button>
      )}
    </div>
  );
}
