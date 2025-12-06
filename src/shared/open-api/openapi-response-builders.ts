import { z } from "zod";

import type { ResponseConfig } from "@asteasolutions/zod-to-openapi";
import type { ZodType } from "zod";

export const ErrorSchema = z.object({
  success: z.boolean().default(false),
  message: z.string(),
  statusCode: z.number(),
  requestId: z.string().optional(),
});

export const ValidationErrorSchema = ErrorSchema.extend({
  errors: z.array(
    z.object({
      field: z.string(),
      message: z.string(),
    }),
  ),
});

const errorResponses: Record<number, ResponseConfig> = {
  400: {
    description: "Bad Request",
    content: {
      "application/json": {
        schema: ErrorSchema,
      },
    },
  },
  401: {
    description: "Unauthorized",
    content: {
      "application/json": {
        schema: ErrorSchema,
      },
    },
  },
  403: {
    description: "Forbidden",
    content: {
      "application/json": {
        schema: ErrorSchema,
      },
    },
  },
  404: {
    description: "Not Found",
    content: {
      "application/json": {
        schema: ErrorSchema,
      },
    },
  },
  422: {
    description: "Validation Error",
    content: {
      "application/json": {
        schema: ValidationErrorSchema,
      },
    },
  },
  500: {
    description: "Internal Server Error",
    content: {
      "application/json": {
        schema: ErrorSchema,
      },
    },
  },
};

export function createApiResponse(
  schema: ZodType,
  description: string,
  statusCode = 200,
  extraStatusCodes: (keyof typeof errorResponses)[] = [],
): { [statusCode: string]: ResponseConfig } {
  const responses: Record<number, ResponseConfig> = {
    [statusCode]: {
      description,
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            statusCode: z.number(),
            requestId: z.string().optional(),
            data: schema,
          }),
        },
      },
    },
  };

  extraStatusCodes.forEach((code) => {
    if (errorResponses[code]) {
      responses[code] = errorResponses[code];
    }
  });

  return responses;
}

export function createApiPaginatedResponse(
  schema: ZodType,
  description: string,
  statusCode = 200,
  extraStatusCodes: (keyof typeof errorResponses)[] = [],
): { [statusCode: string]: ResponseConfig } {
  const responses: Record<number, ResponseConfig> = {
    [statusCode]: {
      description,
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            statusCode: z.number(),
            requestId: z.string().optional(),
            data: schema,
            meta: z.object({
              total: z.number(),
              page: z.number(),
              limit: z.number(),
              totalPages: z.number(),
            }),
            links: z.object({
              first: z.string().nullable(),
              prev: z.string().nullable(),
              next: z.string().nullable(),
              last: z.string().nullable(),
            }),
          }),
        },
      },
    },
  };

  extraStatusCodes.forEach((code) => {
    if (errorResponses[code]) {
      responses[code] = errorResponses[code];
    }
  });

  return responses;
}
