import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_PORT: z.coerce.number().default(3000),
  APP_BASE_PATH: z.string().default("/api/v1"),
  CORS_ORIGIN: z
    .string()
    .default("*")
    .refine(
      (val) => {
        // In production, CORS_ORIGIN cannot be '*' because we use credentials: true
        // This would allow any website to make authenticated requests to our API
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
  FRONTEND_URL: z.string().default("http://localhost:3000"),

  DATABASE_URL: z.string().optional(),
  DATABASE_URL_OTHER: z.string().optional(),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(1000),

  RATE_LIMIT_LOGIN_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_LOGIN_MAX: z.coerce.number().default(5),
  RATE_LIMIT_REGISTER_WINDOW_MS: z.coerce.number().default(60 * 60 * 1000),
  RATE_LIMIT_REGISTER_MAX: z.coerce.number().default(3),
  RATE_LIMIT_PASSWORD_RESET_WINDOW_MS: z.coerce.number().default(60 * 60 * 1000),
  RATE_LIMIT_PASSWORD_RESET_MAX: z.coerce.number().default(3),
  RATE_LIMIT_VERIFICATION_WINDOW_MS: z.coerce.number().default(60 * 60 * 1000),
  RATE_LIMIT_VERIFICATION_MAX: z.coerce.number().default(10),

  PAGINATION_DEFAULT_LIMIT: z.coerce.number().default(10),

  SWAGGER_SERVER_URL: z.string().optional(),

  LOG_LEVEL: z.enum(["debug", "info", "warn", "error", "fatal"]).default("info"),
  LOG_DRIVER: z.enum(["file", "stdout", "stack"]).default("file"),
  LOG_FILE_PATH: z.string().default("logs"),
  ERROR_REPORTING: z.enum(["none", "sentry", "honeybadger"]).default("none"),

  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters")
    .refine(
      (val) => {
        // In production, require strong secrets (64+ characters recommended)
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
  JWT_ACCESS_EXPIRATION: z.string().default("15m"),
  JWT_REFRESH_EXPIRATION: z.string().default("7d"),
  AUTH_MAX_LOGIN_ATTEMPTS: z.coerce.number().default(3),
  AUTH_LOCK_DURATION_MINUTES: z.coerce.number().default(30),
  AUTH_EMAIL_VERIFICATION_EXPIRATION_HOURS: z.coerce.number().default(24),
  AUTH_PASSWORD_RESET_EXPIRATION_MINUTES: z.coerce.number().default(60),

  SMTP_HOST: z.string().default("localhost"),
  SMTP_PORT: z.coerce.number().default(1025),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default("noreply@example.com"),

  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  QUEUE_JOB_ATTEMPTS: z.coerce.number().default(3),
  QUEUE_JOB_BACKOFF_DELAY: z.coerce.number().default(1000),
  QUEUE_JOB_REMOVE_ON_COMPLETE: z.coerce.boolean().default(true),
  QUEUE_JOB_REMOVE_ON_FAIL: z.coerce.boolean().default(false),
  QUEUE_FAILED_JOB_RETENTION_DAYS: z.coerce.number().default(7),
  QUEUE_FAILED_JOB_ALERT_THRESHOLD: z.coerce.number().default(100),

  ENABLE_BACKGROUND_JOBS: z.coerce.boolean().default(true),

  TEST_MAILPIT_URL: z.string().default("http://localhost:8025"),
  TEST_TIMEOUT_MS: z.coerce.number().default(20000),
});

/**
 * Type-safe environment variables.
 * Validated by Zod (Single Source of Truth).
 */
export const env = envSchema.parse(process.env);
