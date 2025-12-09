import "dotenv/config";
import { z } from "zod";

const boolStr = z
  .string()
  .transform((s) => s === "true");

const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_PORT: z.coerce.number().default(3000),
  APP_BASE_PATH: z.string().default("/api/v1"),

  // CORS Configuration
  CORS_ORIGIN: z
    .string()
    .default("*")
    .refine(
      (val) => {
        if (process.env.NODE_ENV === "production" && val === "*") {
          return false;
        }
        return true;
      },
      {
        message:
          "CORS_ORIGIN cannot be '*' in production when using credentials. Please specify allowed origins (e.g., 'https://yourdomain.com')",
      },
    ),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DATABASE_URL_OTHER: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error", "fatal"]).default("info"),
  LOG_DRIVER: z.enum(["file", "stdout", "stack"]).default("file"),
  LOG_FILE_PATH: z.string().default("logs"),
  ERROR_REPORTING: z.enum(["none", "sentry", "honeybadger"]).default("none"),

  // Swagger
  SWAGGER_SERVER_URL: z.string().url().optional(),

  // Rate Limiting (Global)
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(1000),

  // Auth Configuration
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters")
    .refine(
      (val) => {
        if (process.env.NODE_ENV === "production" && val.length < 64) {
          return false;
        }
        return true;
      },
      {
        message:
          "JWT_SECRET must be at least 64 characters in production. Generate with: openssl rand -base64 64",
      },
    ),
  JWT_REFRESH_SECRET: z.string().min(32).optional(),
  JWT_ACCESS_EXPIRATION: z.string().default("15m"),
  JWT_REFRESH_EXPIRATION: z.string().default("7d"),
  AUTH_MAX_LOGIN_ATTEMPTS: z.coerce.number().default(3),
  AUTH_LOCK_DURATION_MINUTES: z.coerce.number().default(30),
  AUTH_EMAIL_VERIFICATION_EXPIRATION_HOURS: z.coerce.number().default(24),
  AUTH_PASSWORD_RESET_EXPIRATION_MINUTES: z.coerce.number().default(60),

  // Auth Rate Limits
  RATE_LIMIT_LOGIN_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_LOGIN_MAX: z.coerce.number().default(5),
  RATE_LIMIT_REGISTER_WINDOW_MS: z.coerce.number().default(60 * 60 * 1000), // 1 hour
  RATE_LIMIT_REGISTER_MAX: z.coerce.number().default(3),
  RATE_LIMIT_PASSWORD_RESET_WINDOW_MS: z.coerce.number().default(60 * 60 * 1000), // 1 hour
  RATE_LIMIT_PASSWORD_RESET_MAX: z.coerce.number().default(3),
  RATE_LIMIT_VERIFICATION_WINDOW_MS: z.coerce.number().default(60 * 60 * 1000), // 1 hour
  RATE_LIMIT_VERIFICATION_MAX: z.coerce.number().default(10),

  // Mail
  SMTP_HOST: z.string().default("localhost"),
  SMTP_PORT: z.coerce.number().default(1025),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().default("noreply@example.com"),

  // Test Configuration
  TEST_MAILPIT_URL: z.string().url().default("http://localhost:8025"),
  TEST_TIMEOUT_MS: z.coerce.number().default(20000),

  // Queue
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  QUEUE_JOB_ATTEMPTS: z.coerce.number().default(3),
  QUEUE_JOB_BACKOFF_DELAY: z.coerce.number().default(1000),
  QUEUE_JOB_REMOVE_ON_COMPLETE: boolStr.default(true),
  QUEUE_JOB_REMOVE_ON_FAIL: boolStr.default(false),
  QUEUE_FAILED_JOB_RETENTION_DAYS: z.coerce.number().default(7),
  QUEUE_FAILED_JOB_ALERT_THRESHOLD: z.coerce.number().default(100),

  // Feature Flags
  ENABLE_BACKGROUND_JOBS: boolStr.default(true),

  // Pagination
  PAGINATION_DEFAULT_LIMIT: z.coerce.number().default(10),
});

export const env = envSchema.parse(process.env);
