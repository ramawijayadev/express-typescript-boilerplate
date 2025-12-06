import { env } from "@/app/env";

/**
 * Rate Limiting Configuration.
 * Defines the window duration and maximum attempts for various endpoints.
 */
export const rateLimitConfig = {
  login: {
    windowMs: env.RATE_LIMIT_LOGIN_WINDOW_MS,
    max: env.RATE_LIMIT_LOGIN_MAX,
  },
  register: {
    windowMs: env.RATE_LIMIT_REGISTER_WINDOW_MS,
    max: env.RATE_LIMIT_REGISTER_MAX,
  },
  passwordReset: {
    windowMs: env.RATE_LIMIT_PASSWORD_RESET_WINDOW_MS,
    max: env.RATE_LIMIT_PASSWORD_RESET_MAX,
  },
  verification: {
    windowMs: env.RATE_LIMIT_VERIFICATION_WINDOW_MS,
    max: env.RATE_LIMIT_VERIFICATION_MAX,
  },
  global: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
  },
};
