import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { appConfig } from "@/config/app";

extendZodWithOpenApi(z);

export const createExampleSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    description: z.string().nullish(),
  })
  .openapi("CreateExampleInput");

export const updateExampleSchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().nullish(),
  })
  .openapi("UpdateExampleInput");

export const listExamplesQuerySchema = z.object({
  search: z.string().optional(),
  page: z.string().optional().default("1").transform(Number),
  limit: z
    .string()
    .optional()
    .default(appConfig.pagination.defaultLimit.toString())
    .transform(Number),
});

export const exampleIdSchema = z.object({
  id: z.string().transform((val) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) {
      throw new Error("Invalid ID format");
    }
    return num;
  }),
});

export const ExampleSchema = z
  .object({
    id: z.number().openapi({ description: "The auto-generated id of the example" }),
    name: z.string().openapi({ description: "The name of the example" }),
    description: z.string().nullable().openapi({ description: "The description of the example" }),
    createdAt: z.string().datetime().openapi({ description: "The date the example was created" }),
    updatedAt: z
      .string()
      .datetime()
      .openapi({ description: "The date the example was last updated" }),
  })
  .openapi("Example");

export type CreateExampleInput = z.infer<typeof createExampleSchema>;
export type UpdateExampleInput = z.infer<typeof updateExampleSchema>;
export type ListExamplesQuery = z.infer<typeof listExamplesQuerySchema>;
