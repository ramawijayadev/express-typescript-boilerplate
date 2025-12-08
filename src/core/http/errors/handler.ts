import { logger } from "@/core/logging/logger";
import { clientError, serverError, validationError } from "@/shared/http/api-response";

import { mapError } from "./mappers";

import type { ErrorRequestHandler } from "express";

/**
 * Global Error Handling Middleware.
 *
 * This middleware acts as the final safety net for the application.
 * It intercepts all errors, transforms them into a standardized format using mappers,
 * logs them with appropriate severity, and sends a consistent JSON response to the client.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const path = req.originalUrl ?? req.url;
  const requestId = req.requestId;

  const { statusCode, message, errors } = mapError(err);

  if (statusCode >= 500) {
    logger.error({ err, path, requestId, statusCode }, "Unhandled exception occurred");
  } else {
    logger.warn({ err, path, requestId, statusCode }, `Operational error: ${message}`);
  }

  if (errors) {
    return validationError(res, errors, message);
  }

  if (statusCode >= 500) {
    return serverError(res, message, statusCode);
  }

  return clientError(res, statusCode, message);
};
