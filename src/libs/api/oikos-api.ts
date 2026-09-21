import "server-only";

import type { Client } from "@oikos-circular-environment/oikos-sdk/client";
import { createClient } from "@oikos-circular-environment/oikos-sdk/client";
import { headers as nextHeaders } from "next/headers";
import { getApiUrl, getClientApiKey } from "@/libs/env";

function buildClient(): Client {
  const api = createClient({ baseURL: getApiUrl() });

  api.instance.interceptors.request.use((requestConfig) => {
    requestConfig.headers.set("X-Client-Key", getClientApiKey());
    return requestConfig;
  });

  return api;
}

export function createServerApiClient(headers?: Headers): Client {
  const api = buildClient();

  if (headers) {
    api.instance.interceptors.request.use((requestConfig) => {
      const cookie = headers.get("cookie");
      if (cookie) {
        requestConfig.headers.set("cookie", cookie);
      }
      return requestConfig;
    });
  }

  return api;
}

export async function getRequestApiClient(): Promise<Client> {
  return createServerApiClient(await nextHeaders());
}

export const apiClient = buildClient();
