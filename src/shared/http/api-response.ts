import { StatusCodes } from "http-status-codes";

import type { Response } from "express";

export type FieldError = {
  field: string;
  message: string;
};

export type SuccessResponse<T = unknown> = {
  success: true;
  message: string;
  statusCode: number;
  data?: T;
  meta?: Record<string, unknown>;
  links?: Record<string, unknown>;
  requestId?: string;
};

export type ClientErrorResponse = {
  success: false;
  message: string;
  statusCode: number;
  errors?: FieldError[];
  requestId?: string;
};

export type ServerErrorResponse = {
  success: false;
  message: string;
  statusCode: number;
  requestId?: string;
};

export type ApiResponse<T = unknown> =
  | SuccessResponse<T>
  | ClientErrorResponse
  | ServerErrorResponse;

export type StatusCode = (typeof StatusCodes)[keyof typeof StatusCodes];

// 2xx helper
export function ok<T>(res: Response, data: T, message = "OK"): Response<ApiResponse<T>> {
  const body: SuccessResponse<T> = {
    success: true,
    message,
    statusCode: StatusCodes.OK,
    data,
  };

  return res.status(body.statusCode).json(body);
}

export function okWithMeta<T>(
  res: Response,
  data: T,
  meta: Record<string, unknown>,
  message = "OK",
): Response<ApiResponse<T>> {
  const body: SuccessResponse<T> = {
    success: true,
    message,
    statusCode: StatusCodes.OK,
    data,
    meta,
  };

  return res.status(body.statusCode).json(body);
}

export function okPaginated<T>(
  res: Response,
  data: T,
  meta: Record<string, unknown>,
  links: Record<string, unknown> = {},
  message = "OK",
): Response<ApiResponse<T>> {
  const body: SuccessResponse<T> = {
    success: true,
    message,
    statusCode: StatusCodes.OK,
    data,
    meta,
    links,
  };

  return res.status(body.statusCode).json(body);
}

export function created<T>(res: Response, data: T, message = "Created"): Response<ApiResponse<T>> {
  const body: SuccessResponse<T> = {
    success: true,
    message,
    statusCode: StatusCodes.CREATED,
    data,
  };

  return res.status(body.statusCode).json(body);
}

// 4xx helper
export function clientError(
  res: Response,
  statusCode: StatusCode,
  message?: string,
  errors?: FieldError[],
): Response<ApiResponse<never>> {
  const body: ClientErrorResponse = {
    success: false,
    message: message ?? "Client error",
    statusCode,
    ...(errors && errors.length > 0 ? { errors } : {}),
    requestId: res.req.requestId,
  };

  return res.status(body.statusCode).json(body);
}

export function validationError(
  res: Response,
  errors: FieldError[],
  message = "Validation failed",
): Response<ApiResponse<never>> {
  return clientError(res, StatusCodes.UNPROCESSABLE_ENTITY, message, errors);
}

// 5xx helper
export function serverError(
  res: Response,
  message = "Internal server error",
  statusCode: StatusCode = StatusCodes.INTERNAL_SERVER_ERROR,
): Response<ApiResponse<never>> {
  const body: ServerErrorResponse = {
    success: false,
    message,
    statusCode,
    requestId: res.req.requestId,
  };

  return res.status(body.statusCode).json(body);
}
