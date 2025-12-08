import type { NextFunction, Request, Response } from "express";

/**
 * Middleware to sanitize request inputs (body, query, params).
 * Mitigates NoSQL injection (by removing $) and Prototype Pollution risks.
 */
export function sanitizeInput(req: Request, _res: Response, next: NextFunction) {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    Object.defineProperty(req, "query", {
      value: sanitizeObject(req.query),
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }

  if (req.params) {
    Object.defineProperty(req, "params", {
      value: sanitizeObject(req.params),
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }

  next();
}

/**
 * Recursively sanitizes data by stripping dangerous keys and characters.
 */
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
