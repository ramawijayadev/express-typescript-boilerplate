import { z } from "zod";

import type { ZodType } from "zod";

export function createApiResponse(schema: ZodType, description: string) {
  return {
    200: {
      description,
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: schema,
          }),
        },
      },
    },
  };
}

export function createApiPaginatedResponse(schema: ZodType, description: string) {
  return {
    200: {
      description,
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
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
}
