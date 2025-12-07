import { logger } from "@/core/logging/logger";

/** Should be called as early as possible in the application lifecycle. */
export function initTracing() {
  logger.info("Tracing initialized");
}
