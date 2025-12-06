import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const userIdSchema = z.object({
  id: z.coerce.number().openapi({ example: 1 }),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional().openapi({ example: "John Doe" }),
  // Email update might require verification flow, kept simple for now
  email: z.string().email().optional().openapi({ example: "john@example.com" }),
});
