import { appConfig } from "@/config/app";
import { logger } from "@/core/logging/logger";

import { createApp } from "./app";

const app = createApp();

app.listen(appConfig.port, () => {
  logger.info(`Server running on port ${appConfig.port}`);
});
