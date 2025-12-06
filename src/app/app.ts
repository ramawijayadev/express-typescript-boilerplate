import express from "express";
import swaggerUi from "swagger-ui-express";

import { swaggerSpec } from "@/config/swagger";
import { errorHandler } from "@/core/http/error-handler";
import { registerMiddlewares } from "@/core/http/middlewares";
import { registerRoutes } from "@/core/http/router";
import { logger } from "@/core/logging/logger";

/**
 * Bootstraps the Express application.
 *
 * This function configures the main Express app instance by:
 * 1. Registering global middleware (CORS, Helmet, BodyParser, etc).
 * 2. Setting up Swagger documentation.
 * 3. Registering the main API router.
 * 4. Registering the global error handler.
 *
 * @param configure - Optional callback to further configure the app (useful for testing).
 * @returns The configured Express application instance.
 */
export function createApp(configure?: (app: express.Express) => void) {
  const app = express();

  registerMiddlewares(app);

  app.get(
    "/",
    swaggerUi.setup(swaggerSpec, {
      swaggerOptions: {
        defaultModelsExpandDepth: -1,
      },
    })
  );
  app.use("/", swaggerUi.serve);

  registerRoutes(app);
  if (configure) {
    configure(app);
  }

  app.use(errorHandler);

  logger.info("Express app initialized");

  return app;
}
