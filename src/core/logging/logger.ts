import { AsyncLocalStorage } from "async_hooks";
import path from "path";

import pino from "pino";

import { loggingConfig } from "@/config/logging";

// Request Context Store
export const requestContext = new AsyncLocalStorage<Map<string, unknown>>();

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
/**
 * Global application logger instance (Pino).
 * 
 * Features:
 * - Structured JSON logging.
 * - Automatic redaction of sensitive keys (passwords, tokens).
 * - Request context isolation (via AsyncLocalStorage).
 * - Multi-transport support (Console in Dev, File/Stream in Prod).
 */
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
