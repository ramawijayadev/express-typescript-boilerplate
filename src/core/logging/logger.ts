import path from "node:path";

import pino from "pino";

import { loggingConfig } from "@/config/logging";

import { requestContext } from "./context";

import type { WriteStream } from "node:fs";

const redacts = [
  "req.headers.authorization",
  "req.body.password",
  "req.body.token",
  "password",
  "token",
  "accessToken",
  "refreshToken",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const streams: Array<{ stream: any }> = [{ stream: process.stdout }];

if (loggingConfig.driver === "file" || loggingConfig.isProduction) {
  streams.push({
    stream: pino.destination({
      dest: path.join(process.cwd(), loggingConfig.filePath, "app"),
      minLength: 4096,
      sync: false,
    }) as unknown as WriteStream,
  });
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
