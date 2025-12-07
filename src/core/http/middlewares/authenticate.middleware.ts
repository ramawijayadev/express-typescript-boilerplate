import { StatusCodes } from "http-status-codes";

import { verifyToken } from "@/core/auth/jwt";
import { logger } from "@/core/logging/logger";
import { AppError } from "@/shared/errors/AppError";

import type { NextFunction, Request, Response } from "express";

/**
 * Enforces JWT Bearer Authentication.
 * Verifies the token and attaches the user identity to the request context.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    next(new AppError(StatusCodes.UNAUTHORIZED, "No token provided"));
    return;
  }

  const token = authHeader.split(" ")[1];
  // Guard clause against empty tokens (e.g. "Bearer ")
  if (!token) {
    next(new AppError(StatusCodes.UNAUTHORIZED, "Invalid token format"));
    return;
  }

  try {
    const payload = verifyToken(token);

    // Type 'user' is now globally defined in src/shared/types/express.d.ts
    req.user = { id: payload.userId };

    next();
  } catch (error) {
    logger.warn({ err: error }, "Authentication failed: Invalid token");
    next(new AppError(StatusCodes.UNAUTHORIZED, "Invalid or expired token"));
  }
}
