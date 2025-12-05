import { AsyncLocalStorage } from "async_hooks";
import path from "path";
import pino from "pino";

import { loggingConfig } from "@/config/logging";

// Request Context Store
export const requestContext = new AsyncLocalStorage<Map<string, any>>();

// Redaction Keys
const redacts = [
  "req.headers.authorization",
  "req.body.password",
  "req.body.token",
  "password",
  "token",
  "accessToken",
  "refreshToken",
];

// Transport Configuration
const transports = [];

if (loggingConfig.isDevelopment) {
  transports.push({
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  });
}

if (loggingConfig.driver === "file" || loggingConfig.isProduction) {
  transports.push({
    target: "pino-roll",
    options: {
      file: path.join(process.cwd(), loggingConfig.filePath, "app"),
      frequency: "daily",
      extension: ".log",
      mkdir: true,
      dateFormat: "yyyy-MM-dd",
      size: "10m",
      limit: {
        count: 30, // keep 30 files
      },
    },
  });
}

// Create Logger
export const logger = pino({
  level: loggingConfig.level,
  redact: redacts,
  transport: {
    targets: transports,
  },
  mixin: () => {
    const context = requestContext.getStore();
    return context ? Object.fromEntries(context) : {};
  },
});

// Helper to run with context
export function runWithContext(context: Record<string, any>, callback: () => void) {
  const store = new Map(Object.entries(context));
  requestContext.run(store, callback);
}
