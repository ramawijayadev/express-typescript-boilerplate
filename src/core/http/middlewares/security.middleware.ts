import { NextFunction, Request, Response } from "express";

export function securityMiddleware(
  _req: Request,
  _res: Response,
  next: NextFunction,
) {
  // Security extra logic (IP allowlist, etc).
  next();
}
