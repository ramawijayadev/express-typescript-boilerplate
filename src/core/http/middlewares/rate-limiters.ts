import { rateLimit } from "express-rate-limit";

import { env } from "@/app/env";
import { rateLimitConfig } from "@/config/rate-limit";

const isTest = env.NODE_ENV === "test";

import type { RequestHandler } from "express";

const noOpMiddleware: RequestHandler = (_req, _res, next) => next();

/**
 * Strict rate limiter for login endpoint.
 * Prevents brute-force password attacks.
 */
export const loginRateLimiter = isTest
  ? noOpMiddleware
  : rateLimit({
      windowMs: rateLimitConfig.login.windowMs,
      max: rateLimitConfig.login.max,
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
      windowMs: rateLimitConfig.register.windowMs,
      max: rateLimitConfig.register.max,
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
      windowMs: rateLimitConfig.passwordReset.windowMs,
      max: rateLimitConfig.passwordReset.max,
      message: "Too many password reset attempts, please try again later",
      standardHeaders: true,
      legacyHeaders: false,
    });

export const verificationRateLimiter = isTest
  ? noOpMiddleware
  : rateLimit({
      windowMs: rateLimitConfig.verification.windowMs,
      max: rateLimitConfig.verification.max,
      message: "Too many verification attempts, please try again later",
      standardHeaders: true,
      legacyHeaders: false,
    });

export const globalRateLimiter = isTest
  ? noOpMiddleware
  : rateLimit({
      windowMs: rateLimitConfig.global.windowMs,
      max: rateLimitConfig.global.max,
      standardHeaders: true,
      legacyHeaders: false,
    });
