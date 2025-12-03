import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import { AppError } from "@/shared/errors/AppError";
import { type FieldError, created, ok, validationError } from "@/shared/http/api-response";

export const testResponsesRouter = Router();

// 200 OK
testResponsesRouter.get("/success-200", (_req, res) => {
  return ok(res, { foo: "bar" });
});

// 201 Created
testResponsesRouter.post("/success-201", (_req, res) => {
  return created(res, { id: "123" });
});

// 401 Unauthorized
testResponsesRouter.get("/unauthorized", (_req, _res) => {
  throw new AppError(StatusCodes.UNAUTHORIZED, "Unauthorized");
});

// 403 Forbidden
testResponsesRouter.get("/forbidden", (_req, _res) => {
  throw new AppError(StatusCodes.FORBIDDEN, "Forbidden");
});

// 404 Not found
testResponsesRouter.get("/not-found", (_req, _res) => {
  throw new AppError(StatusCodes.NOT_FOUND, "Example not found");
});

// 422 Validation error
testResponsesRouter.post("/validation-error", (_req, res) => {
  const errors: FieldError[] = [
    { field: "email", message: "Invalid email format" },
    { field: "password", message: "Password too short" },
  ];

  return validationError(res, errors);
});

// 500 Internal server error
testResponsesRouter.get("/server-error", (_req, _res) => {
  throw new Error("Boom from server-error route");
});

// 503 Service unavailable
testResponsesRouter.get("/service-unavailable", (_req, _res) => {
  throw new AppError(StatusCodes.SERVICE_UNAVAILABLE, "Service unavailable");
});
