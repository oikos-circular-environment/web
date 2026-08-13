function getApiInternalUrl(): string {
  const baseUrl = process.env.API_INTERNAL_URL;

  if (!baseUrl) {
    throw new Error(
      "API_INTERNAL_URL não configurada. Defina a variável de ambiente apontando para o backend (ver .env.example).",
    );
  }

  return baseUrl;
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  return fetch(`${getApiInternalUrl()}${path}`, {
    ...init,
    headers: {
      "X-Client-Key": process.env.CLIENT_API_KEY ?? "",
      ...init.headers,
    },
  });
}
