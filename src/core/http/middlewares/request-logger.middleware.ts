import { v4 as uuidv4 } from "uuid";

import { logger, runWithContext } from "@/core/logging/logger";

import type { RequestHandler } from "express";

export const requestLoggerMiddleware: RequestHandler = (req, res, next) => {
  const requestId = (req.headers["x-request-id"] as string) || uuidv4();
  req.requestId = requestId;
  req.startTime = Date.now();

  const context = {
    requestId,
    service: "api", // Could be configurable
  };

  runWithContext(context, () => {
    logger.info({
      msg: "Incoming request",
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.ip,
    });

    res.on("finish", () => {
      const durationMs = Date.now() - req.startTime;

      logger.info({
        msg: "Request completed",
        method: req.method,
        url: req.originalUrl || req.url,
        statusCode: res.statusCode,
        durationMs,
      });
    });

    next();
  });
};
