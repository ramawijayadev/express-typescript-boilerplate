import express from "express";
import swaggerUi from "swagger-ui-express";

import { swaggerSpec } from "@/config/swagger";

import { errorHandler } from "@/core/http/error-handler";
import { registerMiddlewares } from "@/core/http/middlewares";
import { registerRoutes } from "@/core/http/router";
import { logger } from "@/core/logging/logger";

export function createApp(configure?: (app: express.Express) => void) {
  const app = express();

  registerMiddlewares(app);

  registerMiddlewares(app);

  app.get("/", swaggerUi.setup(swaggerSpec));
  app.use("/", swaggerUi.serve);

  registerRoutes(app);
  if (configure) {
    configure(app);
  }

  app.use(errorHandler);

  logger.info("Express app initialized");

  return app;
}
