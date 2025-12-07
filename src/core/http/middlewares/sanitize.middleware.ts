import type { NextFunction, Request, Response } from "express";

export function sanitizeInput(req: Request, _res: Response, next: NextFunction) {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query) as typeof req.query;
  }
  if (req.params) {
    req.params = sanitizeObject(req.params) as typeof req.params;
  }
  next();
}

function sanitizeObject(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "string") {
    return obj.replace(/[${}]/g, "").replace(/\0/g, "").trim();
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === "object") {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith("$")) {
        continue;
      }

      if (key.includes("__proto__") || key.includes("constructor") || key.includes("prototype")) {
        continue;
      }

      sanitized[key] = sanitizeObject(value);
    }

    return sanitized;
  }

  return obj;
}
