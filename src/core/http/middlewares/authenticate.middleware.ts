import { StatusCodes } from "http-status-codes";

import { verifyToken } from "@/core/auth/jwt";
import { logger } from "@/core/logging/logger";
import { AppError } from "@/shared/errors/AppError";

import type { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
      };
    }
  }
}

/**
 * Middleware to protect routes using JWT Bearer Authentication.
 * Verifies the token and attaches the user identity to `req.user`.
 * Throws 401 if token is missing or invalid.
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization as string | undefined;

  if (!authHeader?.startsWith("Bearer ")) {
    next(new AppError(StatusCodes.UNAUTHORIZED, "No token provided"));
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
     next(new AppError(StatusCodes.UNAUTHORIZED, "Invalid token format"));
     return;
  }

  try {
    // Payload has userId as number from jwt verify
    const payload = verifyToken(token);
    
    // We modify req.user directly but typed usage should happen in controllers
    req.user = { id: payload.userId };
    next();
  } catch (error) {
    logger.warn({ err: error }, "Invalid token");
    next(new AppError(StatusCodes.UNAUTHORIZED, "Invalid token"));
  }
}
