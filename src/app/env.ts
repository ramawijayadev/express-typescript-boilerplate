import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  APP_PORT: z.coerce.number().default(3000),
  APP_BASE_PATH: z.string().default("/api/v1"),
});

export const env = envSchema.parse(process.env);
