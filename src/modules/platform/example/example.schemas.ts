import { z } from "zod";

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
});

export type CreateExampleInput = z.infer<typeof createExampleSchema>;
export type UpdateExampleInput = z.infer<typeof updateExampleSchema>;
export type ListExamplesQuery = z.infer<typeof listExamplesQuerySchema>;
