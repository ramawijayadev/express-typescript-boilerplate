import path from "node:path";

import pino from "pino";

import { loggingConfig } from "@/config/logging";

import { requestContext } from "./context";

const redacts = [
  "req.headers.authorization",
  "req.body.password",
  "req.body.token",
  "password",
  "token",
  "accessToken",
  "refreshToken",
];

const streams: pino.StreamEntry[] = [{ stream: process.stdout }];

if (loggingConfig.driver === "file" || loggingConfig.isProduction) {
  const rollingTransport = pino.transport({
    target: "pino-roll",
    options: {
      file: path.join(process.cwd(), loggingConfig.filePath, "app"),
      frequency: "daily",
      size: "20m",
      limit: { count: 14 },
      dateFormat: "yyyy-MM-dd",
      extension: ".log",
      mkdir: true,
      sync: false,
    },
  });

  streams.push({ stream: rollingTransport });
}

/**
 * Structured JSON logging with automatic redaction.
 * Enriched with data from the global Request Context (requestId, etc).
 */
export const logger = pino(
  {
    level: loggingConfig.level,
    redact: redacts,
    mixin: () => {
      const context = requestContext.getStore();
      return context ? Object.fromEntries(context) : {};
    },
  },
  pino.multistream(streams),
);
