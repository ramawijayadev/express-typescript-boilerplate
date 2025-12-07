import express from "express";
import swaggerUi from "swagger-ui-express";

import { env } from "@/app/env";
import { swaggerSpec } from "@/config/swagger";
import { errorHandler } from "@/core/http/errors/handler";
import { registerMiddlewares } from "@/core/http/middlewares";
import { registerRoutes } from "@/core/http/router";
import { logger } from "@/core/logging/logger";

/** Bootstraps the Express application. */
export function createApp(configure?: (app: express.Express) => void) {
  const app = express();

  registerMiddlewares(app);

  if (env.NODE_ENV !== "production") {
    app.get(
      "/",
      swaggerUi.setup(swaggerSpec, {
        swaggerOptions: {
          defaultModelsExpandDepth: -1,
        },
      }),
    );
    app.use("/", swaggerUi.serve);
  } else {
    app.get("/", (_req, res) => {
      res.json({ message: "API is running. Documentation available in development mode." });
    });
  }

  registerRoutes(app);
  if (configure) {
    configure(app);
  }

  app.use(errorHandler);

  logger.info("Express app initialized");

  return app;
}
