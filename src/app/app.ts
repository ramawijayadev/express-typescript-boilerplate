import express from "express";
import { logger } from "@/core/logging/logger";
import { registerMiddlewares } from "@/core/http/middlewares";
import { registerRoutes } from "@/core/http/router";
import { errorHandler } from "@/core/http/error-handler";

export function createApp() {
  const app = express();

  registerMiddlewares(app);
  registerRoutes(app);

  app.use(errorHandler);

  logger.info("Express app initialized");

  return app;
}
