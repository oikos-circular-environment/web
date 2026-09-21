"use server";

import {
  getV1Profiles,
  getV1ProfilesAddresses,
  putV1Profiles,
} from "@oikos-circular-environment/oikos-sdk/sdk.gen";
import type {
  GetV1ProfilesAddressesResponse,
  GetV1ProfilesResponse,
  PutV1ProfilesData,
} from "@oikos-circular-environment/oikos-sdk/types.gen";
import { getRequestApiClient } from "@/libs/api/oikos-api";

export async function getProfileAction(): Promise<GetV1ProfilesResponse | null> {
  const { data, error } = await getV1Profiles({
    client: await getRequestApiClient(),
  });

  if (error || !data) return null;
  return data;
}

export async function getProfileAddressAction(): Promise<GetV1ProfilesAddressesResponse | null> {
  const { data, error } = await getV1ProfilesAddresses({
    client: await getRequestApiClient(),
  });

  if (error || !data) return null;
  return data;
}

export async function updateProfileAction(
  input: PutV1ProfilesData["body"],
): Promise<GetV1ProfilesResponse["profile"]> {
  const { data, error } = await putV1Profiles({
    client: await getRequestApiClient(),
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
