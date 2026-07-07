import { logs, SeverityNumber } from "@opentelemetry/api-logs";
import type { Instrumentation } from "next";

// Guard: sem OTEL_EXPORTER_OTLP_ENDPOINT, register() nao cria o SDK — no-op em dev local.
export async function register() {
  // O Next builda este arquivo tambem para o Edge Runtime, que nao tem process.on/etc do
  // Node. O setup real (registerOTel + metricas de runtime + logs) mora em lib/otel-node.ts,
  // carregado via import() dinamico aqui dentro do branch nodejs pra nunca entrar na
  // analise estatica do bundle edge.
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

// web nao tinha nenhum log saindo pro Loki (sem pino/transport equivalente ao api) - captura
// pelo menos os erros reais de produção via o hook nativo do Next. @opentelemetry/api-logs e
// so a API facade (edge-safe, no-op sem LoggerProvider registrado), por isso nao precisa do
// mesmo guard de runtime do register() acima.
export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  const message = error instanceof Error ? error.message : String(error);

  logs.getLogger("oikos-web").emit({
    severityNumber: SeverityNumber.ERROR,
    severityText: "ERROR",
    body: message,
    attributes: {
      "http.route": context.routePath,
      "http.request.method": request.method,
      "next.route_type": context.routeType,
    },
  });
};
