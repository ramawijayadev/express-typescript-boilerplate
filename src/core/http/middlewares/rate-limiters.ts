import rateLimit from "express-rate-limit";

import { config } from "@/config";

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
      windowMs: config.security.rateLimit.login.windowMs,
      max: config.security.rateLimit.login.max,
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
      windowMs: config.security.rateLimit.register.windowMs,
      max: config.security.rateLimit.register.max,
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
      windowMs: config.security.rateLimit.passwordReset.windowMs,
      max: config.security.rateLimit.passwordReset.max,
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
      windowMs: config.security.rateLimit.verification.windowMs,
      max: config.security.rateLimit.verification.max,
      message: "Too many verification attempts, please try again later",
      standardHeaders: true,
      legacyHeaders: false,
    });
