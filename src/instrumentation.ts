// Guard: sem OTEL_EXPORTER_OTLP_ENDPOINT, register() nao cria o SDK — no-op em dev local.
export async function register() {
  // O Next builda este arquivo tambem para o Edge Runtime, que nao tem process.on/etc do
  // Node. O setup real do NodeSDK mora em lib/otel-node.ts, carregado via import() dinamico
  // aqui dentro do branch nodejs pra nunca entrar na analise estatica do bundle edge.
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

  if (!endpoint) {
    return;
  }

  const { startOtel } = await import("./lib/otel-node");
  startOtel(endpoint);
}
