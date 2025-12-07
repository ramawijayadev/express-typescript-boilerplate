import { AsyncLocalStorage } from "async_hooks";
import path from "path";

import pino from "pino";

import { loggingConfig } from "@/config/logging";

import type { WriteStream } from "node:tty";

export const requestContext = new AsyncLocalStorage<Map<string, unknown>>();

const redacts = [
  "req.headers.authorization",
  "req.body.password",
  "req.body.token",
  "password",
  "token",
  "accessToken",
  "refreshToken",
];

const streams = [{ stream: process.stdout }];

if (loggingConfig.driver === "file" || loggingConfig.isProduction) {
  streams.push({
    stream: pino.destination({
      dest: path.join(process.cwd(), loggingConfig.filePath, "app"), // app.log
      minLength: 4096, // Buffer
      sync: false,
    }) as unknown as WriteStream & { fd: 1 },
  });
}

/**
 * Global application logger instance (Pino).
 * Structured JSON logging with automatic redaction and request context isolation.
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

/**
 * Executes a callback within a distinct logging context.
 * Any logs written during the callback will get the `context` fields attached automatically.
 *
 * @param context - Key-value pairs to attach to logs.
 * @param callback - Function to execute.
 */
export function runWithContext(context: Record<string, unknown>, callback: () => void) {
  const store = new Map(Object.entries(context));
  requestContext.run(store, callback);
}
