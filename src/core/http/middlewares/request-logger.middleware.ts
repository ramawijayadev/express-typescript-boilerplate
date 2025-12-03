import { logger } from "@/core/logging/logger";

import type { NextFunction, Request, Response } from "express";

export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - start;

    logger.info({
      msg: "HTTP request completed",
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl ?? req.url,
      status: res.statusCode,
      durationMs,
    });
  });

  next();
}
