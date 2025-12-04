import { z } from "zod";

import { appConfig } from "@/config/app";

export const createExampleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullish(),
});

export const updateExampleSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullish(),
});

export const listExamplesQuerySchema = z.object({
  search: z.string().optional(),
  page: z.string().optional().default("1").transform(Number),
  limit: z
    .string()
    .optional()
    .default(appConfig.pagination.defaultLimit.toString())
    .transform(Number),
});

export type CreateExampleInput = z.infer<typeof createExampleSchema>;
export type UpdateExampleInput = z.infer<typeof updateExampleSchema>;
export type ListExamplesQuery = z.infer<typeof listExamplesQuerySchema>;

export const exampleIdSchema = z.object({
  id: z.string().transform((val) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) {
      throw new Error("Invalid ID format");
    }
    return num;
  }),
});
