import { NextFunction, Request, Response } from "express";

export function authContextMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  (res.locals as any).user = null;
  next();
}
