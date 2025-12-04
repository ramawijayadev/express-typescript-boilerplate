import { appConfig } from "@/config/app";
import { logger } from "@/core/logging/logger";
import { initMetrics } from "@/core/observability/metrics";
import { initTracing } from "@/core/observability/tracing";

import { createApp } from "./app";

const app = createApp();

initMetrics(app);
initTracing();

app.listen(appConfig.port, () => {
  logger.info(`Server running on port ${appConfig.port}`);
});
