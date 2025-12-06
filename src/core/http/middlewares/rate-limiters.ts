import rateLimit from "express-rate-limit";

/**
 * Strict rate limiter for login endpoint.
 * Prevents brute-force password attacks.
 * 
 * Limits: 5 attempts per IP per 15 minutes
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP
  message: "Too many login attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

/**
 * Strict rate limiter for registration endpoint.
 * Prevents spam registrations and email enumeration.
 * 
 * Limits: 3 registrations per IP per hour
 */
export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per IP per hour
  message: "Too many registration attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for password reset requests.
 * Prevents email bombing and DoS attacks.
 * 
 * Limits: 3 reset requests per IP per hour
 */
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 reset requests per IP per hour
  message: "Too many password reset attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Moderate rate limiter for email verification endpoints.
 * Allows more attempts than critical endpoints but still prevents abuse.
 * 
 * Limits: 10 attempts per IP per hour
 */
export const verificationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: "Too many verification attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});
