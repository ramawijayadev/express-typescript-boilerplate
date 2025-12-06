/**
 * Unit tests for API Response Helpers.
 */
import { StatusCodes } from "http-status-codes";
import { describe, expect, it } from "vitest";

import {
  type ApiResponse,
  type FieldError,
  clientError,
  created,
  ok,
  okWithMeta,
  serverError,
  validationError,
} from "@/shared/http/api-response";

import type { Response } from "express";

type MockState<T = unknown> = {
  body?: ApiResponse<T>;
  statusCode?: number;
};

function createMockResponse<T = unknown>(): { res: Response; state: MockState<T> } {
  const state: MockState<T> = {};

  const res = {
    req: {
      requestId: "test-request-id",
    },
    status(code: number) {
      state.statusCode = code;
      return this;
    },
    json(payload: ApiResponse<T>) {
      state.body = payload;
      return this;
    },
  } as unknown as Response;

  return { res, state };
}

describe("api-response helpers", () => {
  it("ok should return 200 success with data and default message", () => {
    const { res, state } = createMockResponse<{ foo: string }>();

    ok(res, { foo: "bar" });

    expect(state.statusCode).toBe(StatusCodes.OK);
    expect(state.body).toEqual({
      success: true,
      message: "OK",
      statusCode: StatusCodes.OK,
      data: { foo: "bar" },
    });
  });

  it("ok should allow custom message", () => {
    const { res, state } = createMockResponse<string>();

    ok(res, "hello", "Custom OK");

    expect(state.body).toEqual({
      success: true,
      message: "Custom OK",
      statusCode: StatusCodes.OK,
      data: "hello",
    });
  });

  it("created should return 201 success with data and default message", () => {
    const { res, state } = createMockResponse<{ id: string }>();

    created(res, { id: "123" });

    expect(state.statusCode).toBe(StatusCodes.CREATED);
    expect(state.body).toEqual({
      success: true,
      message: "Created",
      statusCode: StatusCodes.CREATED,
      data: { id: "123" },
    });
  });

  it("okWithMeta should include meta and data", () => {
    const { res, state } = createMockResponse<string[]>();

    okWithMeta(
      res,
      ["a", "b"],
      {
        page: 1,
        perPage: 10,
        total: 2,
      },
      "List fetched",
    );

    expect(state.body).toEqual({
      success: true,
      message: "List fetched",
      statusCode: StatusCodes.OK,
      data: ["a", "b"],
      meta: {
        page: 1,
        perPage: 10,
        total: 2,
      },
    });
  });

  it("clientError should return 4xx with errors when provided", () => {
    const { res, state } = createMockResponse<never>();
    const errors: FieldError[] = [
      { field: "email", message: "Email is required" },
      { field: "password", message: "Password too short" },
    ];

    clientError(res, StatusCodes.BAD_REQUEST, "Invalid input", errors);

    expect(state.statusCode).toBe(StatusCodes.BAD_REQUEST);
    expect(state.body).toEqual({
      success: false,
      message: "Invalid input",
      statusCode: StatusCodes.BAD_REQUEST,
      requestId: "test-request-id",
      errors,
    });
  });

  it("clientError should NOT include errors key when not provided", () => {
    const { res, state } = createMockResponse<never>();

    clientError(res, StatusCodes.FORBIDDEN, "Forbidden");

    expect(state.body).toEqual({
      success: false,
      message: "Forbidden",
      statusCode: StatusCodes.FORBIDDEN,
      requestId: "test-request-id",
    });
    expect("errors" in (state.body as object)).toBe(false);
  });

  it("validationError should be a shortcut for 422 with errors", () => {
    const { res, state } = createMockResponse<never>();
    const errors: FieldError[] = [{ field: "name", message: "Name is required" }];

    validationError(res, errors);

    expect(state.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
    expect(state.body).toEqual({
      success: false,
      message: "Validation failed",
      statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
      requestId: "test-request-id",
      errors,
    });
  });

  it("serverError should return 500 by default without errors", () => {
    const { res, state } = createMockResponse<never>();

    serverError(res);

    expect(state.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(state.body).toEqual({
      success: false,
      message: "Internal server error",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      requestId: "test-request-id",
    });
  });

  it("serverError should allow custom message and status code", () => {
    const { res, state } = createMockResponse<never>();

    serverError(res, "Service unavailable", StatusCodes.SERVICE_UNAVAILABLE);

    expect(state.body).toEqual({
      success: false,
      message: "Service unavailable",
      statusCode: StatusCodes.SERVICE_UNAVAILABLE,
      requestId: "test-request-id",
    });
  });
});
