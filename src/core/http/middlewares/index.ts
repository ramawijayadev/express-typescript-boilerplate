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
  const isTest = process.env.NODE_ENV === "test";
  const { corsOrigin, rateLimit: limitConfig } = appConfig;

  // Core Security Headers
  app.disable("x-powered-by");
  app.use(helmet(getHelmetConfig(isTest)));
  app.use(hpp());
  app.use(
    cors({
      origin: corsOrigin === "*" ? "*" : corsOrigin.split(","),
      credentials: true,
    }),
  );

  // Traffic Control
  if (!isTest) {
    app.use(
      rateLimit({
        windowMs: limitConfig.windowMs,
        max: limitConfig.max,
        standardHeaders: true,
        legacyHeaders: false,
      }),
    );
  }

  // Body & Cookie Parsing
  app.use(express.json({ limit: "10kb" }));
  app.use(cookieParser());

  // Input Sanitization
  if (!isTest) {
    app.use(sanitizeInput);
  }

  // Logging
  app.use(requestLoggerMiddleware);
}

/**
 * Returns Strict Content Security Policy (CSP) for Production.
 * Disables CSP in tests to avoid conflicts with supertest/test-runners.
 */
function getHelmetConfig(isTest: boolean) {
  if (isTest) {
    return { contentSecurityPolicy: false };
  }

  return {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Needed for Swagger UI
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
  };
}
