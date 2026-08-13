import { getApiUrl } from "@/lib/env";
import type { Client } from "@/libs/oikos-sdk/client";
import { createClient } from "@/libs/oikos-sdk/client";

const API_KEY =
  process.env.CLIENT_API_KEY ?? process.env.NEXT_PUBLIC_CLIENT_API_KEY ?? "";

function buildClient(config?: Parameters<typeof createClient>[0]): Client {
  const api = createClient({ baseURL: getApiUrl(), ...config });

  api.instance.interceptors.request.use((requestConfig) => {
    requestConfig.headers.set("X-Client-Key", API_KEY);
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
