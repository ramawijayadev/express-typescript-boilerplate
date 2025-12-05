import { z } from "zod";

import { appConfig } from "@/config/app";

/**
 * @swagger
 * components:
 *   schemas:
 *     Example:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the example
 *         name:
 *           type: string
 *           description: The name of the example
 *         description:
 *           type: string
 *           nullable: true
 *           description: The description of the example
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the example was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the example was last updated
 *       example:
 *         id: 1
 *         name: My Example
 *         description: This is a description
 *         createdAt: 2023-01-01T00:00:00.000Z
 *         updatedAt: 2023-01-01T00:00:00.000Z
 *     CreateExampleInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the example
 *         description:
 *           type: string
 *           description: The description of the example
 *       example:
 *         name: New Example
 *         description: Description of the new example
 *     UpdateExampleInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the example
 *         description:
 *           type: string
 *           description: The description of the example
 *       example:
 *         name: Updated Example
 *         description: Updated description
 */

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
