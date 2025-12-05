import { appConfig } from "@/config/app";
import { logger } from "@/core/logging/logger";
import { initMetrics } from "@/core/observability/metrics";
import { initTracing } from "@/core/observability/tracing";
import { initJobs } from "@/jobs/index";

import { createApp } from "./app";
import { env } from "./env";

const app = createApp();

initMetrics(app);
initTracing();

if (env.ENABLE_BACKGROUND_JOBS) {
  initJobs();
}

const server = app.listen(appConfig.port, () => {
  logger.info(`Server running on port ${appConfig.port}`);
});

async function shutdown(signal: string) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close(() => {
    logger.info("HTTP server closed");
  });

  try {
    await import("@/core/database/connection").then((m) => m.disconnectAll());
    logger.info("Database connections closed");
    
    if (env.ENABLE_BACKGROUND_JOBS) {
      await import("@/jobs/index").then((m) => m.shutdownJobs());
    }
    
    process.exit(0);
  } catch (err) {
    logger.error({ err }, "Error during database disconnection");
    process.exit(1);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
