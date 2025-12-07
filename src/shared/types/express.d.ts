import type { AuthContext } from "@/core/http/middlewares/auth-context.middleware";

declare global {
  namespace Express {
    interface Request {
      /**
       * Identity from Auth Middleware (JWT).
       * Populated by `authenticate.middleware.ts`.
       */
      user?: {
        id: number;
      };

      /**
       * Context for RBAC / Authorization.
       * Populated by `auth-context.middleware.ts`.
       */
      auth?: AuthContext | undefined;

      /**
       * Unique Request ID for tracing.
       * Populated by `request-id.middleware.ts`.
       */
      requestId: string;

      /**
       * Request start time (timestamp) for duration calculation.
       * Populated by `request-logger.middleware.ts`.
       */
      startTime: number;
    }
  }
}

export {};
