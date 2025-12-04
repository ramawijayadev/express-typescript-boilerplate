import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "@/app/app";
import { testResponsesRouter } from "@/shared/http/__tests__/test-responses.routes";

describe("API response formatter - E2E", () => {
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
    });
  });
});
