"use server";

import { cookies } from "next/headers";
import { createServerApiClient } from "@/libs/api/oikos-api";
import {
  getV1Profiles,
  getV1ProfilesAddresses,
  putV1Profiles,
} from "@/libs/oikos-sdk/sdk.gen";
import type {
  GetV1ProfilesAddressesResponse,
  GetV1ProfilesResponse,
  PutV1ProfilesData,
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

export async function getProfileAction(): Promise<GetV1ProfilesResponse | null> {
  const token = await getSessionToken();
  if (!token) return null;

  const { data, error } = await getV1Profiles({
    client: await buildServerClient(),
    headers: { Authorization: `Bearer ${token}` },
  });

  if (error || !data) return null;
  return data;
}

export async function getProfileAddressAction(): Promise<GetV1ProfilesAddressesResponse | null> {
  const token = await getSessionToken();
  if (!token) return null;

  const { data, error } = await getV1ProfilesAddresses({
    client: await buildServerClient(),
    headers: { Authorization: `Bearer ${token}` },
  });

  if (error || !data) return null;
  return data;
}

export async function updateProfileAction(
  input: PutV1ProfilesData["body"],
): Promise<GetV1ProfilesResponse["profile"]> {
  const token = await getSessionToken();
  if (!token) {
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  const { data, error } = await putV1Profiles({
    client: await buildServerClient(),
    headers: { Authorization: `Bearer ${token}` },
    body: input,
  });

  if (error || !data) {
    const message =
      error && "message" in error && typeof error.message === "string"
        ? error.message
        : "Não foi possível salvar suas alterações.";
    throw new Error(message);
  }

  return data.profile;
}
