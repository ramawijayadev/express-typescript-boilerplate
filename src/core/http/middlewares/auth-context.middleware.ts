import type { NextFunction, Request, Response } from "express";

export interface AuthContext {
  userId?: string;
  roles?: string[];
  permissions?: string[];
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export function authContextMiddleware(req: Request, _res: Response, next: NextFunction) {
  req.auth = undefined;

  next();
}
