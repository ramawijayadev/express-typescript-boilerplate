import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const userIdSchema = z.object({
  id: z.coerce.number().openapi({ example: 1 }),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional().openapi({ example: "John Doe" }),
  email: z.string().email().optional().openapi({ example: "john@example.com" }),
});

export const UserSchema = z
  .object({
    id: z.number().openapi({ description: "The auto-generated id of the example" }),
    name: z.string().openapi({ description: "The name of the example" }),
  })
  .openapi("Example");
