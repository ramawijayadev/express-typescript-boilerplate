import { logger } from "@/core/logging/logger";

import type { Express } from "express";

/**
 * Initializes application metrics (Prometheus, etc).
 * This acts as a hook to attach metrics middleware to the Express app.
 */

/**
 * Initializes application metrics (Prometheus, etc).
 * This acts as a hook to attach metrics middleware to the Express app.
 */
export function initMetrics(_app: Express) {
  // Placeholder for metrics initialization (Prometheus, etc.)
  // app.use(metricsMiddleware)
  logger.info("Metrics initialized");
}
