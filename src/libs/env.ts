function required(name: string, value: string | undefined, hint = ""): string {
  if (!value) {
    throw new Error(`${name} não configurada. Ver .env.example.${hint}`);
  }
  return value;
}

export function getApiUrl(): string {
  return required("NEXT_PUBLIC_API_URL", process.env.NEXT_PUBLIC_API_URL);
}

export function getClientApiKey(): string {
  return process.env.CLIENT_API_KEY ?? "";
}

export function getTurnstileSiteKey(): string {
  return required(
    "TURNSTILE_SITE_KEY",
    process.env.TURNSTILE_SITE_KEY,
    " O formulário de Suporte depende do Turnstile - em desenvolvimento, use a sitekey de teste da Cloudflare (1x00000000000000000000AA) junto de TURNSTILE_SECRET_KEY.",
  );
}

export function getTurnstileSecretKey(): string {
  return process.env.TURNSTILE_SECRET_KEY ?? "";
}

export function getOtelEndpoint(): string | undefined {
  return process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
}
