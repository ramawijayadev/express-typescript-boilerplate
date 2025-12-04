import express from "express";

import { errorHandler } from "@/core/http/error-handler";
import { registerMiddlewares } from "@/core/http/middlewares";
import { registerRoutes } from "@/core/http/router";
import { logger } from "@/core/logging/logger";

export function createApp(configure?: (app: express.Express) => void) {
  const app = express();

  registerMiddlewares(app);
  registerRoutes(app);
  if (configure) {
    configure(app);
  }

  app.use(errorHandler);

  logger.info("Express app initialized");

  return app;
}
