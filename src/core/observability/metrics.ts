import { logger } from "@/core/logging/logger";

import type { Express } from "express";

export function initMetrics(_app: Express) {
  logger.info("Metrics initialized");
}
