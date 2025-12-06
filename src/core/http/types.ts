import type { NextFunction, Request, Response } from "express";

// Safe definition for Express Query Parameters ensuring no explicit 'any'
export interface SafeParsedQs {
  [key: string]: undefined | string | string[] | SafeParsedQs | SafeParsedQs[];
}

// Express uses 'any' for Params/Query/ResBody, and strict 'unknown' causes type incompatibility
export type TypedRequest<
  Body = unknown,
  Query = SafeParsedQs,
  Params = Record<string, string>,
> = Request<Params, unknown, Body, Query>;

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
 * Type-safe wrapper for Express route handlers.
 * Encapsulates the type casting required for Express compatibility.
 * 
 * @example
 * authRouter.post("/login", validateBody(loginSchema),
 *   typedHandler<LoginBody>(authController.login)
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
 * Type-safe wrapper for authenticated Express route handlers.
 * Encapsulates the type casting required for Express compatibility.
 * 
 * @example
 * authRouter.post("/profile", authenticate,
 *   authenticatedHandler<UpdateProfileBody>(authController.updateProfile)
 * );
 */
export function authenticatedHandler<Body = unknown, Query = SafeParsedQs, Params = Record<string, string>>(
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
