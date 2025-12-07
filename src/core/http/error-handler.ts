import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";

import { logger } from "@/core/logging/logger";
import { Prisma } from "@prisma/client";
import { AppError } from "@/shared/errors/AppError";
import {
  type FieldError,
  type StatusCode,
  clientError,
  serverError,
  validationError,
} from "@/shared/http/api-response";

import type { ErrorRequestHandler } from "express";

/**
 * Global Error Handler Middleware.
 * Intercepts errors, formats them into a standard JSON response, and handles logging.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const path = req.originalUrl ?? req.url;
  const requestId = req.requestId;

  if (err instanceof AppError) {
    logger.warn(
      {
        err,
        path,
        statusCode: err.statusCode,
      },
      "Handled AppError",
    );

    if (err.statusCode === StatusCodes.UNPROCESSABLE_ENTITY && Array.isArray(err.details)) {
      return validationError(res, err.details as FieldError[], err.message);
    }

    if (err.statusCode >= 400 && err.statusCode < 500) {
      return clientError(
        res,
        err.statusCode as StatusCode,
        err.message,
        Array.isArray(err.details) ? (err.details as FieldError[]) : undefined,
      );
    }

    return serverError(res, err.message, err.statusCode as StatusCode);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      logger.warn({ path, code: err.code }, "Prisma error: Record not found");
      return clientError(res, StatusCodes.NOT_FOUND, "Record not found");
    }
  }

  if (err instanceof ZodError) {
    const errors: FieldError[] = err.issues.map((issue) => ({
      field: issue.path.length ? issue.path.join(".") : "root",
      message: issue.message,
    }));

    logger.warn(
      {
        path,
        errors,
      },
      "Validation error (ZodError)",
    );

    return validationError(res, errors);
  }

  logger.error(
    {
      err,
      path,
      requestId,
    },
    "Unhandled error",
  );

  return serverError(res);
};
