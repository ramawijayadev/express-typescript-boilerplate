import { NextFunction, Request, Response } from "express";
import { logger } from "@/core/logging/logger";

export function requestLoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const start = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - start;
    const requestId = (res.locals as any).requestId;

    logger.info(
      {
        requestId,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs,
      },
      "HTTP request completed",
    );
  });

  next();
}
