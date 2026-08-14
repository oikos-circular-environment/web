import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { RuntimeNodeInstrumentation } from "@opentelemetry/instrumentation-runtime-node";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { FetchInstrumentation, registerOTel } from "@vercel/otel";

// Isolado de instrumentation.ts de proposito: o Next builda esse arquivo tambem para o
// Edge Runtime e sinaliza qualquer uso de API do Node (process.on etc.) mesmo atras de um
// guard em runtime — separar em modulo proprio, carregado so via import() dinamico no
// branch nodejs, evita o analisador estatico do bundle edge ver esse codigo.
//
// @vercel/otel cobre traces (fetch instrumentation, deteccao de resource attributes,
// e leitura de OTEL_EXPORTER_OTLP_ENDPOINT/OTEL_EXPORTER_OTLP_PROTOCOL/etc pro exporter
// de traces automaticamente). O que ele nao cobre - metricas de runtime do Node/V8
// (event loop lag, duracao de GC por tipo, heap por geracao) e logs - fica com
// RuntimeNodeInstrumentation + um MetricReader/LogRecordProcessor OTLP nativos,
// passados via config. onRequestError (em instrumentation.ts) usa o LoggerProvider
// que esse LogRecordProcessor alimenta.
export function startOtel(endpoint: string) {
  registerOTel({
    serviceName: "oikos-web",
    instrumentations: [
      new FetchInstrumentation(),
      new RuntimeNodeInstrumentation({ monitoringPrecision: 5_000 }),
    ],
    metricReaders: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: `${endpoint}/v1/metrics`,
        }),
        exportIntervalMillis: 30_000,
      }),
    ],
    logRecordProcessors: [
      new BatchLogRecordProcessor({
        exporter: new OTLPLogExporter({
          url: `${endpoint}/v1/logs`,
        }),
      }),
    ],
  });
}
