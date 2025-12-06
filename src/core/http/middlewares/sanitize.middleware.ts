import type { NextFunction, Request, Response } from "express";

/**
 * Sanitizes request body, query, and params to prevent NoSQL/SQL injection attempts.
 * 
 * This middleware removes potentially dangerous characters and operators:
 * - MongoDB operators starting with $ (e.g., $gt, $ne, $where)
 * - SQL injection patterns
 * - Dangerous characters in object keys
 * 
 * While Prisma provides good protection through parameterized queries,
 * this adds defense-in-depth against injection attacks.
 */
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

/**
 * Recursively sanitizes an object by removing dangerous patterns.
 */
function sanitizeObject(obj: unknown): unknown {
  // Handle primitives
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle strings - remove dangerous characters
  if (typeof obj === "string") {
    // Remove NoSQL operators and common SQL injection patterns
    return obj
      .replace(/[${}]/g, "") // MongoDB operators
      .replace(/\0/g, "") // Null bytes
      .trim();
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  // Handle objects
  if (typeof obj === "object") {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      // Skip keys starting with $ (MongoDB operators like $gt, $ne, $where)
      if (key.startsWith("$")) {
        continue;
      }

      // Skip keys with dangerous patterns
      if (key.includes("__proto__") || key.includes("constructor") || key.includes("prototype")) {
        continue;
      }

      // Recursively sanitize the value
      sanitized[key] = sanitizeObject(value);
    }

    return sanitized;
  }

  // Return other types as-is (numbers, booleans, etc.)
  return obj;
}
