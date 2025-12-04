import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_PORT: z.coerce.number().default(3000),
  APP_BASE_PATH: z.string().default("/api/v1"),
  CORS_ORIGIN: z.string().default("*"),

  // Database
  DATABASE_URL: z.string().optional(),
  DATABASE_URL_OTHER: z.string().optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(1000),

  // Pagination
  PAGINATION_DEFAULT_LIMIT: z.coerce.number().default(10),

  // Swagger
  SWAGGER_SERVER_URL: z.string().optional(),
});

export const env = envSchema.parse(process.env);
