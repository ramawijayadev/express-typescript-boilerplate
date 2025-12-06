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
  QUEUE_JOB_ATTEMPTS: z.coerce.number().default(3),
  QUEUE_JOB_BACKOFF_DELAY: z.coerce.number().default(1000),
  QUEUE_JOB_REMOVE_ON_COMPLETE: z.coerce.boolean().default(true),
  QUEUE_JOB_REMOVE_ON_FAIL: z.coerce.boolean().default(false),
  QUEUE_FAILED_JOB_RETENTION_DAYS: z.coerce.number().default(7),
  QUEUE_FAILED_JOB_ALERT_THRESHOLD: z.coerce.number().default(100),
  
  // Feature Flags
  ENABLE_BACKGROUND_JOBS: z.coerce.boolean().default(true),
});

/**
 * Type-safe environment variables.
 *
 * Validated by Zod to ensure all required variables are present and correctly typed.
 * This object serves as the SINGLE SOURCE OF TRUTH for all configuration values.
 * Do NOT use `process.env` directly in application code; import `env` from here instead.
 */
export const env = envSchema.parse(process.env);
