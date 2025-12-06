import rateLimit from "express-rate-limit";

import type { RequestHandler } from "express";

const isTest = process.env.NODE_ENV === "test";

// Helper to create a no-op middleware for tests
const noOpMiddleware: RequestHandler = (_req, _res, next) => next();

/**
 * Strict rate limiter for login endpoint.
 * Prevents brute-force password attacks.
 */
export const loginRateLimiter = isTest
  ? noOpMiddleware
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: "Too many login attempts, please try again later",
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false,
    });

/**
 * Strict rate limiter for registration endpoint.
 * Prevents spam registrations and email enumeration.
 */
export const registerRateLimiter = isTest
  ? noOpMiddleware
  : rateLimit({
      windowMs: 60 * 60 * 1000,
      max: 3,
      message: "Too many registration attempts, please try again later",
      standardHeaders: true,
      legacyHeaders: false,
    });

/**
 * Strict rate limiter for password reset requests.
 * Prevents email bombing and DoS attacks.
 */
export const passwordResetRateLimiter = isTest
  ? noOpMiddleware
  : rateLimit({
      windowMs: 60 * 60 * 1000,
      max: 3,
      message: "Too many password reset attempts, please try again later",
      standardHeaders: true,
      legacyHeaders: false,
    });

/**
 * Moderate rate limiter for email verification endpoints.
 */
export const verificationRateLimiter = isTest
  ? noOpMiddleware
  : rateLimit({
      windowMs: 60 * 60 * 1000,
      max: 10,
      message: "Too many verification attempts, please try again later",
      standardHeaders: true,
      legacyHeaders: false,
    });
