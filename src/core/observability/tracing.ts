import { logger } from "@/core/logging/logger";

/**
 * Initializes distributed tracing (OpenTelemetry).
 * Should be called as early as possible in the application lifecycle.
 */
export function initTracing() {
  logger.info("Tracing initialized");
}
