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
  emailVerificationExpirationHours: env.AUTH_EMAIL_VERIFICATION_EXPIRATION_HOURS,
  passwordResetExpirationMinutes: env.AUTH_PASSWORD_RESET_EXPIRATION_MINUTES,
};
