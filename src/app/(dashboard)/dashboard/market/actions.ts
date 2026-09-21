"use server";

import { getV1Market } from "@oikos-circular-environment/oikos-sdk/sdk.gen";
import type {
  GetV1MarketData,
  GetV1MarketResponse,
} from "@oikos-circular-environment/oikos-sdk/types.gen";
import { getRequestApiClient } from "@/libs/api/oikos-api";

export async function getMarketAction(
  params: GetV1MarketData["query"],
): Promise<GetV1MarketResponse | null> {
  const { data, error } = await getV1Market({
    client: await getRequestApiClient(),
    query: params,
  });

  if (error || !data) return null;
  return data;
}
