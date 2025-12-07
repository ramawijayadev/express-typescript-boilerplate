import { StatusCodes } from "http-status-codes";
import { ZodError as ZodErrorClass } from "zod";

import { AppError } from "@/shared/errors/AppError";
import type { FieldError } from "@/shared/http/api-response";

import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ZodError, ZodTypeAny } from "zod";

function mapZodError(err: ZodError): FieldError[] {
  return err.issues.map((issue) => ({
    field: issue.path.length ? issue.path.join(".") : "root",
    message: issue.message,
  }));
}

function handleZodError(err: unknown): never {
  if (err instanceof ZodErrorClass) {
    const errors = mapZodError(err);
    throw new AppError(StatusCodes.UNPROCESSABLE_ENTITY, "Validation failed", errors);
  }

  throw err;
}

export function validateBody<T extends ZodTypeAny>(schema: T): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (err) {
      handleZodError(err);
    }
  };
}

export function validateQuery<T extends ZodTypeAny>(schema: T): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.query);
      Object.defineProperty(req, "query", {
        value: { ...req.query, ...(parsed as Record<string, unknown>) },
        writable: true,
        enumerable: true,
        configurable: true,
      });
      next();
    } catch (err) {
      handleZodError(err);
    }
  };
}

export function validateParams<T extends ZodTypeAny>(schema: T): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.params);
      req.params = parsed as unknown as Request["params"];
      next();
    } catch (err) {
      handleZodError(err);
    }
  };
}
