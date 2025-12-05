import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { verifyToken } from "@/core/auth/jwt";
import { logger } from "@/core/logging/logger";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
      };
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: "No token provided",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.userId };
    next();
  } catch (error) {
    logger.warn({ err: error }, "Invalid token");
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: "Invalid token",
    });
  }
}
