import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type IdParam = z.infer<typeof idParamSchema>;
