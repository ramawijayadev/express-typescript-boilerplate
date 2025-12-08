import type { NextFunction, Request, Response } from "express";

export interface AuthContext {
  userId?: string;
  roles?: string[];
  permissions?: string[];
}

/**
 * Initializes the authentication context on the request object.
 * Ensures req.auth is always defined, even if empty.
 */
export function authContextMiddleware(req: Request, _res: Response, next: NextFunction) {
  req.auth = undefined;
  next();
}
