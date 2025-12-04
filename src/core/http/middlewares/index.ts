import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";

import { authContextMiddleware } from "./auth-context.middleware";
import { requestIdMiddleware } from "./request-id.middleware";
import { requestLoggerMiddleware } from "./request-logger.middleware";

import type { Express } from "express";

import { appConfig } from "@/config/app";

// ...

export function registerMiddlewares(app: Express) {
  // HTTP hardening
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: appConfig.corsOrigin === "*" ? "*" : appConfig.corsOrigin.split(","),
      credentials: true,
    }),
  );
  app.use(hpp());

  // Basic rate limiting
  app.use(
    rateLimit({
      windowMs: appConfig.rateLimit.windowMs,
      max: appConfig.rateLimit.max,
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

  app.use(authContextMiddleware);
}
