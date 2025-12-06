import type { NextFunction, Request, Response } from "express";

// ESLint: Using 'any' is intentional here to match Express's type system
// Express uses 'any' for Params/Query/ResBody, and strict 'unknown' causes type incompatibility
/* eslint-disable @typescript-eslint/no-explicit-any */
export type TypedRequest<
  Body = any,
  Query = any,
  Params = any,
> = Request<Params, any, Body, Query>;
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface AuthenticatedRequest<
  Body = unknown,
  Query = unknown,
  Params = unknown,
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
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function typedHandler<Body = any, Query = any, Params = any>(
  handler: (req: TypedRequest<Body, Query, Params>, res: Response, next: NextFunction) => any
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
export function authenticatedHandler<Body = any, Query = any, Params = any>(
  handler: (req: AuthenticatedRequest<Body, Query, Params>, res: Response, next: NextFunction) => any
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req as unknown as AuthenticatedRequest<Body, Query, Params>, res, next);
    } catch (err) {
      next(err);
    }
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
