import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";

import { authContextMiddleware } from "./auth-context.middleware";
import { requestIdMiddleware } from "./request-id.middleware";
import { requestLoggerMiddleware } from "./request-logger.middleware";
import { securityMiddleware } from "./security.middleware";

import type { Express } from "express";

export function registerMiddlewares(app: Express) {
  // HTTP hardening
  app.use(helmet());
  app.use(cors());
  app.use(hpp());

  // Basic rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 1000,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Body & cookie parsing
  app.use(express.json());
  app.use(cookieParser());

  // Internal middlewares
  app.use(requestIdMiddleware);
  app.use(requestLoggerMiddleware);
  app.use(securityMiddleware);
  app.use(authContextMiddleware);
}
