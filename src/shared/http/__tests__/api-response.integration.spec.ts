/**
 * Integration tests for API Response Formatter.
 */
import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { describe, expect, it } from "vitest";


import { createApp } from "@/app/app";
import { AppError } from "@/shared/errors/AppError";
import { type FieldError, created, ok, validationError } from "@/shared/http/api-response";

describe("API response formatter - E2E", () => {
  const testResponsesRouter = Router();

  testResponsesRouter.get("/success-200", (_req, res) => {
    return ok(res, { foo: "bar" });
  });

  testResponsesRouter.post("/success-201", (_req, res) => {
    return created(res, { id: "123" });
  });

  testResponsesRouter.get("/unauthorized", (_req, _res) => {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  });

  testResponsesRouter.get("/forbidden", (_req, _res) => {
    throw new AppError(StatusCodes.FORBIDDEN, "Forbidden");
  });

  testResponsesRouter.get("/not-found", (_req, _res) => {
    throw new AppError(StatusCodes.NOT_FOUND, "Example not found");
  });

  testResponsesRouter.post("/validation-error", (_req, res) => {
    const errors: FieldError[] = [
      { field: "email", message: "Invalid email format" },
      { field: "password", message: "Password too short" },
    ];

    return validationError(res, errors);
  });

  testResponsesRouter.get("/server-error", (_req, _res) => {
    throw new Error("Boom from server-error route");
  });

  testResponsesRouter.get("/service-unavailable", (_req, _res) => {
    throw new AppError(StatusCodes.SERVICE_UNAVAILABLE, "Service unavailable");
  });

  const app = createApp((app) => {
    app.use("/api/v1/_test/responses", testResponsesRouter);
  });

  it("200 OK", async () => {
    const res = await request(app)
      .get("/api/v1/_test/responses/success-200")
      .expect(StatusCodes.OK);

    expect(res.body).toEqual({
      success: true,
      message: "OK",
      statusCode: StatusCodes.OK,
      data: { foo: "bar" },
    });
  });

  it("201 Created", async () => {
    const res = await request(app)
      .post("/api/v1/_test/responses/success-201")
      .expect(StatusCodes.CREATED);

    expect(res.body).toEqual({
      success: true,
      message: "Created",
      statusCode: StatusCodes.CREATED,
      data: { id: "123" },
    });
  });

  it("401 Unauthorized (AppError -> clientError)", async () => {
    const res = await request(app)
      .get("/api/v1/_test/responses/unauthorized")
      .expect(StatusCodes.UNAUTHORIZED);

    expect(res.body).toEqual({
      success: false,
      message: "Unauthorized",
      statusCode: StatusCodes.UNAUTHORIZED,
      requestId: expect.any(String),
    });
  });

  it("403 Forbidden (AppError -> clientError)", async () => {
    const res = await request(app)
      .get("/api/v1/_test/responses/forbidden")
      .expect(StatusCodes.FORBIDDEN);

    expect(res.body).toEqual({
      success: false,
      message: "Forbidden",
      statusCode: StatusCodes.FORBIDDEN,
      requestId: expect.any(String),
    });
  });

  it("404 Not Found (AppError -> clientError)", async () => {
    const res = await request(app)
      .get("/api/v1/_test/responses/not-found")
      .expect(StatusCodes.NOT_FOUND);

    expect(res.body).toEqual({
      success: false,
      message: "Example not found",
      statusCode: StatusCodes.NOT_FOUND,
      requestId: expect.any(String),
    });
  });

  it("422 Validation error (validationError helper)", async () => {
    const res = await request(app)
      .post("/api/v1/_test/responses/validation-error")
      .expect(StatusCodes.UNPROCESSABLE_ENTITY);

    expect(res.body).toEqual({
      success: false,
      message: "Validation failed",
      statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
      requestId: expect.any(String),
      errors: [
        { field: "email", message: "Invalid email format" },
        { field: "password", message: "Password too short" },
      ],
    });
  });

  it("500 Internal server error (unexpected Error)", async () => {
    const res = await request(app)
      .get("/api/v1/_test/responses/server-error")
      .expect(StatusCodes.INTERNAL_SERVER_ERROR);

    expect(res.body).toEqual({
      success: false,
      message: "Internal server error",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      requestId: expect.any(String),
    });
  });

  it("503 Service unavailable (AppError 5xx)", async () => {
    const res = await request(app)
      .get("/api/v1/_test/responses/service-unavailable")
      .expect(StatusCodes.SERVICE_UNAVAILABLE);

    expect(res.body).toEqual({
      success: false,
      message: "Service unavailable",
      statusCode: StatusCodes.SERVICE_UNAVAILABLE,
      requestId: expect.any(String),
    });
  });
});
