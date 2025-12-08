import express from "express";
import swaggerUi from "swagger-ui-express";

import { env } from "@/config/env";
import { swaggerSpec } from "@/config/swagger";
import { errorHandler } from "@/core/http/errors/handler";
import { registerMiddlewares } from "@/core/http/middlewares";
import { registerRoutes } from "@/core/http/router";
import { logger } from "@/core/logging/logger";

export function createApp(configure?: (app: express.Express) => void) {
  const app = express();

  registerMiddlewares(app);

  // Swagger UI
  if (env.NODE_ENV !== "production") {
    app.use("/docs", swaggerUi.serve);
    app.get(
      "/docs",
      swaggerUi.setup(swaggerSpec, {
        swaggerOptions: {
          defaultModelsExpandDepth: -1,
        },
      }),
    );
  }

  // Root endpoint
  app.get("/", (_req, res) => {
    res.json({
      message: "API is running",
      docs: env.NODE_ENV !== "production" ? "/docs" : undefined,
    });
  });

  registerRoutes(app);
  if (configure) {
    configure(app);
  }

  app.use(errorHandler);

  logger.info("Express app initialized");

  return app;
}
