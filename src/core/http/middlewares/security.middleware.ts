import type { NextFunction, Request, Response } from "express";

export function securityMiddleware(_req: Request, _res: Response, next: NextFunction) {
  // Add security hardening later ...
  next();
}
