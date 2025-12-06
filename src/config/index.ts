export * from "./app";
export * from "./rate-limit";
export * from "./auth";

import { env } from "@/app/env";
import { appConfig } from "./app";
import { authConfig } from "./auth";
import { rateLimitConfig } from "./rate-limit";

/**
 * Central Configuration Object.
 * Single Source of Truth for all application settings.
 */
export const config = {
  app: appConfig,
  security: {
    jwt: authConfig.jwt,
    locking: authConfig.locking,
    rateLimit: rateLimitConfig,
    emailVerificationExpirationHours: authConfig.emailVerificationExpirationHours,
    passwordResetExpirationMinutes: authConfig.passwordResetExpirationMinutes,
  },
  test: {
    // Safe defaults using Nullish Coalescing (though Zod also handles this)
    mailpitUrl: env.TEST_MAILPIT_URL ?? "http://localhost:8025",
    timeout: env.TEST_TIMEOUT_MS ?? 20000,
  },
};
