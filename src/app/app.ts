import express from "express";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";

import { swaggerSpec } from "@/config/swagger";

import { errorHandler } from "@/core/http/error-handler";
import { registerMiddlewares } from "@/core/http/middlewares";
import { registerRoutes } from "@/core/http/router";
import { logger } from "@/core/logging/logger";

export function createApp(configure?: (app: express.Express) => void) {
  const app = express();

  registerMiddlewares(app);

  if (process.env.NODE_ENV !== "test") {
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
      standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    });

    app.use(limiter);
  }

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  registerRoutes(app);
  if (configure) {
    configure(app);
  }

  app.use(errorHandler);

  logger.info("Express app initialized");

  return app;
}
