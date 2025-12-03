import { NextFunction, Request, Response } from "express";
import { AppError } from "@/shared/errors/AppError";
import { logger } from "@/core/logging/logger";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    logger.warn(
      {
        err,
        path: req.path,
      },
      "Handled AppError",
    );

    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details ?? null,
      },
    });
  }

  logger.error(
    {
      err,
      path: req.path,
    },
    "Unhandled error",
  );

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong",
    },
  });
}
