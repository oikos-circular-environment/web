import type { Client } from "@oikos-circular-environment/oikos-sdk/client";
import { createClient } from "@oikos-circular-environment/oikos-sdk/client";
import { getApiUrl, getClientApiKey } from "@/libs/env";

function buildClient(config?: Parameters<typeof createClient>[0]): Client {
  const api = createClient({ baseURL: getApiUrl(), ...config });

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

export const apiClient = buildClient({ withCredentials: true });
