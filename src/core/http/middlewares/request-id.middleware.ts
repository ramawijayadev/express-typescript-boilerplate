import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const requestId = uuidv4();

  (res.locals as any).requestId = requestId;
  (req as any).requestId = requestId;

  next();
}
