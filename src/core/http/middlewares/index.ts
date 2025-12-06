import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";

import { appConfig } from "@/config/app";


import { requestLoggerMiddleware } from "./request-logger.middleware";
import { sanitizeInput } from "./sanitize.middleware";

import type { Express } from "express";

export function registerMiddlewares(app: Express) {
  // HTTP hardening
  app.disable("x-powered-by");
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline needed for Swagger UI
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
    }),
  );
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
  app.use(express.json({ limit: "10kb" })); // Prevent DoS via large payloads
  app.use(cookieParser());

  // Security: Sanitize inputs to prevent NoSQL/SQL injection
  app.use(sanitizeInput);

  // Internal middlewares
  app.use(requestLoggerMiddleware);


}
