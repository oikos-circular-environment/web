import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { RuntimeNodeInstrumentation } from "@opentelemetry/instrumentation-runtime-node";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";

// Isolado de instrumentation.ts de proposito: o Next builda esse arquivo tambem para o
// Edge Runtime e sinaliza qualquer uso de API do Node (process.on etc.) mesmo atras de um
// guard em runtime — separar em modulo proprio, carregado so via import() dinamico no
// branch nodejs, evita o analisador estatico do bundle edge ver esse codigo.
// Espelha api/src/lib/otel.ts (mesmo endpoint Alloy) para os dois servicos aparecerem
// correlacionados no mesmo painel/trace.
export function startOtel(endpoint: string) {
  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: "oikos-web",
      [ATTR_SERVICE_VERSION]: process.env.npm_package_version ?? "0.1.0",
      "deployment.environment.name": process.env.NODE_ENV ?? "production",
    }),
    traceExporter: new OTLPTraceExporter({
      url: `${endpoint}/v1/traces`,
    }),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: `${endpoint}/v1/metrics`,
      }),
      exportIntervalMillis: 30_000,
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        // fs e dns geram spans demais sem valor diagnostico
        "@opentelemetry/instrumentation-fs": { enabled: false },
        "@opentelemetry/instrumentation-dns": { enabled: false },
      }),
      // event loop lag/utilization, duracao de GC por tipo, heap por geracao —
      // a metrica que faltava pra distinguir GC/leak de trafego real num pico de CPU.
      new RuntimeNodeInstrumentation({ monitoringPrecision: 5_000 }),
    ],
  });

  sdk.start();

  const shutdown = () => sdk.shutdown().catch(console.error);
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}
