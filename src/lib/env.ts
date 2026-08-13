function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} não configurada. Ver .env.example.`);
  }
  return value;
}

export function getApiUrl(): string {
  return requireEnv("NEXT_PUBLIC_API_URL");
}
