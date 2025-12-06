import type { NextFunction, Request, Response } from "express";

// ESLint: Using 'any' is intentional here to match Express's type system
// Express uses 'any' for Params/Query/ResBody, and strict 'unknown' causes type incompatibility
export type TypedRequest<
  Body = unknown,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Query = any,
  Params = Record<string, string>,
> = Request<Params, unknown, Body, Query>;

export interface AuthenticatedRequest<
  Body = unknown,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Query = any,
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function typedHandler<Body = unknown, Query = any, Params = Record<string, string>>(
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function authenticatedHandler<Body = unknown, Query = any, Params = Record<string, string>>(
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
