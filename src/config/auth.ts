import { env } from "@/app/env";

export const authConfig = {
  jwt: {
    secret: env.JWT_SECRET,
    accessExpiration: env.JWT_ACCESS_EXPIRATION,
    refreshExpiration: env.JWT_REFRESH_EXPIRATION,
  },
  locking: {
    maxAttempts: env.AUTH_MAX_LOGIN_ATTEMPTS,
    durationMinutes: env.AUTH_LOCK_DURATION_MINUTES,
  },
};
