import { Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";

import { AppError } from "@/shared/errors/AppError";
import type { FieldError } from "@/shared/http/api-response";

interface ErrorResponse {
  statusCode: number;
  message: string;
  errors?: FieldError[] | undefined;
}

type ErrorMapper = (err: unknown) => ErrorResponse | null;

/**
 * Maps operational AppError to response format.
 */
const appErrorMapper: ErrorMapper = (err) => {
  if (err instanceof AppError) {
    return {
      statusCode: err.statusCode,
      message: err.message,
      errors: Array.isArray(err.details) ? (err.details as FieldError[]) : undefined,
    };
  }
  return null;
};

/**
 * Maps Zod validation errors to 422 Unprocessable Entity.
 */
const zodErrorMapper: ErrorMapper = (err) => {
  if (err instanceof ZodError) {
    const errors = err.issues.map((issue) => ({
      field: issue.path.join(".") || "root",
      message: issue.message,
    }));

    return {
      statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
      message: "Validation failed",
      errors,
    };
  }
  return null;
};

/**
 * Maps Prisma database errors to HTTP status codes.
 * e.g., Record Not Found (P2025) -> 404.
 */
const prismaErrorMapper: ErrorMapper = (err) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      return {
        statusCode: StatusCodes.NOT_FOUND,
        message: "Record not found",
      };
    }
  }
  return null;
};

const mappers = [appErrorMapper, zodErrorMapper, prismaErrorMapper];

/**
 * Resolves an unknown error object into a standardized ErrorResponse.
 * Falls back to 500 Internal Server Error if no mapper matches.
 */
export function mapError(err: unknown): ErrorResponse {
  for (const mapper of mappers) {
    const result = mapper(err);
    if (result) return result;
  }

  return {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message: "Internal server error",
  };
}
