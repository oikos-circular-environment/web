"use server";

import { cookies } from "next/headers";
import { createServerApiClient } from "@/libs/api/oikos-api";
import { getV1Market } from "@/libs/oikos-sdk/sdk.gen";
import type {
  GetV1MarketData,
  GetV1MarketResponse,
} from "@/libs/oikos-sdk/types.gen";

const SESSION_COOKIE = "oikos_session_token";

async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

async function buildServerClient() {
  const store = await cookies();
  const headers = new Headers();
  const cookie = store.toString();
  if (cookie) {
    headers.set("cookie", cookie);
  }
  return createServerApiClient(headers);
}

export async function getMarketAction(
  params: GetV1MarketData["query"],
): Promise<GetV1MarketResponse | null> {
  const token = await getSessionToken();
  if (!token) return null;

  const { data, error } = await getV1Market({
    client: await buildServerClient(),
    headers: { Authorization: `Bearer ${token}` },
    query: params,
  });

  if (error || !data) return null;
  return data;
}
