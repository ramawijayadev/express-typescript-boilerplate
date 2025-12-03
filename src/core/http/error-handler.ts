import { StatusCodes } from "http-status-codes";

import { logger } from "@/core/logging/logger";
import { AppError } from "@/shared/errors/AppError";
import {
  type FieldError,
  type StatusCode,
  clientError,
  serverError,
} from "@/shared/http/api-response";

import type { NextFunction, Request, Response } from "express";

function isFieldErrorArray(value: unknown): value is FieldError[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === "object" &&
        "field" in item &&
        "message" in item &&
        typeof (item as FieldError).field === "string" &&
        typeof (item as FieldError).message === "string",
    )
  );
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const isDevelopment = process.env.NODE_ENV === "development";

  if (err instanceof AppError) {
    logger.warn(
      {
        err,
        path: req.path,
      },
      "Handled AppError",
    );

    // 4xx => clientError
    if (err.statusCode >= 400 && err.statusCode < 500) {
      const errors = isFieldErrorArray(err.details) ? err.details : undefined;
      return clientError(res, err.statusCode as StatusCode, err.message, errors);
    }

    // 5xx => serverError
    return serverError(
      res,
      err.message,
      (err.statusCode as StatusCode) || StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  logger.error(
    {
      err,
      path: req.path,
    },
    "Unhandled error",
  );

  // Unexpected error => 500 generic
  if (isDevelopment && err instanceof Error) {
    logger.error({ stack: err.stack }, "Unhandled error stack");
  }

  return serverError(res);
}
