import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_PORT: z.coerce.number().default(3000),
  APP_BASE_PATH: z.string().default("/api/v1"),
  CORS_ORIGIN: z.string().default("*"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),

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

  // Logging
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error", "fatal"]).default("info"),
  LOG_DRIVER: z.enum(["file", "stdout", "stack"]).default("file"),
  LOG_FILE_PATH: z.string().default("logs"),
  ERROR_REPORTING: z.enum(["none", "sentry", "honeybadger"]).default("none"),

  // Auth
  JWT_SECRET: z.string(),
  JWT_ACCESS_EXPIRATION: z.string().default("15m"),
  JWT_REFRESH_EXPIRATION: z.string().default("7d"),
  AUTH_MAX_LOGIN_ATTEMPTS: z.coerce.number().default(3),
  AUTH_LOCK_DURATION_MINUTES: z.coerce.number().default(30),
  AUTH_EMAIL_VERIFICATION_EXPIRATION_HOURS: z.coerce.number().default(24),
  AUTH_PASSWORD_RESET_EXPIRATION_MINUTES: z.coerce.number().default(60),

  // Mail
  SMTP_HOST: z.string().default("smtp.mailtrap.io"),
  SMTP_PORT: z.coerce.number().default(2525),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default("noreply@example.com"),

  // Redis / Queue
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  
  // Feature Flags
  ENABLE_BACKGROUND_JOBS: z.coerce.boolean().default(true),
});

export const env = envSchema.parse(process.env);
