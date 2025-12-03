import { createApp } from "./app";
import { appConfig } from "@/config/app";
import { logger } from "@/core/logging/logger";

const app = createApp();

app.listen(appConfig.port, () => {
  logger.info(`Server running on port ${appConfig.port}`);
});
