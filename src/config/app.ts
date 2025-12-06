import { env } from "@/app/env";

/**
 * General application configuration.
 * Contains settings for environment, port, base path, CORS, and rate limiting.
 */
export const appConfig = {
  env: env.NODE_ENV,
  port: env.APP_PORT,
  basePath: env.APP_BASE_PATH,
  corsOrigin: env.CORS_ORIGIN,
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
  },
  pagination: {
    defaultLimit: env.PAGINATION_DEFAULT_LIMIT,
  },
};
