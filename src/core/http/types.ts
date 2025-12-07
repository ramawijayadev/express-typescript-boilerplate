import type { NextFunction, Request, Response } from "express";

/**
 * Recursive definition for Express Query Parameters.
 * Replaces the default 'any' with a type-safe structure.
 */
export interface SafeParsedQs {
  [key: string]: undefined | string | string[] | SafeParsedQs | SafeParsedQs[];
}

/**
 * Strict wrapper around Express Request.
 * Solves the compatibility issue where Express defaults to 'any' but TypeScript expects 'unknown'.
 */
export type TypedRequest<
  Body = unknown,
  Query = SafeParsedQs,
  Params = Record<string, string>,
> = Request<Params, unknown, Body, Query>;

/**
 * Extension of TypedRequest that guarantees the existence of `req.user`.
 * Used for protected routes.
 */
export interface AuthenticatedRequest<
  Body = unknown,
  Query = SafeParsedQs,
  Params = Record<string, string>,
> extends TypedRequest<Body, Query, Params> {
  user: {
    id: number;
  };
}

/**
 * Wraps a controller to provide strict typing for Body, Query, and Params.
 * bridges the gap between untyped Express handlers and our strict Controllers.
 *
 * @example
 * router.post("/login",
 * typedHandler<LoginBody>(authController.login)
 * );
 */
export function typedHandler<Body = unknown, Query = SafeParsedQs, Params = Record<string, string>>(
  handler: (
    req: TypedRequest<Body, Query, Params>,
    res: Response,
    next: NextFunction,
  ) => void | Promise<void> | Response | Promise<Response>,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req as unknown as TypedRequest<Body, Query, Params>, res, next);
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Wraps a controller for protected routes.
 * Ensures `req.user` is typed correctly.
 *
 * @example
 * router.get("/profile", authenticate,
 * authenticatedHandler(authController.getProfile)
 * );
 */
export function authenticatedHandler<
  Body = unknown,
  Query = SafeParsedQs,
  Params = Record<string, string>,
>(
  handler: (
    req: AuthenticatedRequest<Body, Query, Params>,
    res: Response,
    next: NextFunction,
  ) => void | Promise<void> | Response | Promise<Response>,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req as unknown as AuthenticatedRequest<Body, Query, Params>, res, next);
    } catch (err) {
      next(err);
    }
  };
}
