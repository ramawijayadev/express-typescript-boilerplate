import { randomUUID } from "node:crypto";

import type { NextFunction, Request, Response } from "express";

export function requestIdMiddleware(req: Request, _res: Response, next: NextFunction) {
  const headerId = req.headers["x-request-id"];
  const requestId = typeof headerId === "string" && headerId.length > 0 ? headerId : randomUUID();

  req.requestId = requestId;

  next();
}
