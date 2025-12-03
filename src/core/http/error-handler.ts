import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";

import { logger } from "@/core/logging/logger";
import { AppError } from "@/shared/errors/AppError";
import {
  type FieldError,
  clientError,
  serverError,
  validationError,
} from "@/shared/http/api-response";

import type { NextFunction, Request, Response } from "express";

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const isDevelopment = process.env.NODE_ENV === "development";

  if (err instanceof ZodError) {
    const errors: FieldError[] = err.issues.map((issue) => ({
      field: issue.path.length > 0 ? issue.path.join(".") : "root",
      message: issue.message,
    }));

    logger.warn(
      {
        path: req.path,
        errors,
      },
      "Validation error",
    );

    return validationError(res, errors);
  }

  if (err instanceof AppError) {
    logger.warn(
      {
        path: req.path,
        details: err.details,
      },
      "Handled AppError",
    );

    const status = err.statusCode;

    if (status >= 400 && status < 500) {
      const fieldErrors = Array.isArray(err.details) ? (err.details as FieldError[]) : undefined;

      return clientError(res, status, err.message, fieldErrors);
    }

    return serverError(res, err.message, status);
  }

  logger.error(
    {
      path: req.path,
      err,
    },
    "Unhandled error",
  );

  const message = isDevelopment && err instanceof Error ? err.message : "Internal server error";

  return serverError(res, message, StatusCodes.INTERNAL_SERVER_ERROR);
}
