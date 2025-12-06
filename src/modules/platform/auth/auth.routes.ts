import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Router } from "express";


import { authenticate } from "@/core/http/middlewares/authenticate.middleware";
import { validateBody } from "@/core/http/middlewares/validation.middleware";
import type { AuthenticatedRequest, TypedRequest } from "@/core/http/types";
import { createApiResponse } from "@/shared/open-api/openapi-response-builders";

import { AuthController } from "./auth.controller";
import { AuthRepository } from "./auth.repository";
import {
  authResponseSchema,
  emailVerificationSchema,
  forgotPasswordSchema,
  loginSchema,
  logoutResponseSchema,
  profileResponseSchema,
  refreshTokenResponseSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
  successResponseSchema,
} from "./auth.schemas";
import { AuthService } from "./auth.service";

import type {
  EmailVerificationBody,
  ForgotPasswordBody,
  LoginBody,
  RefreshTokenBody,
  RegisterBody,
  ResetPasswordBody,
} from "./auth.types";

export const authRegistry = new OpenAPIRegistry();
export const authRouter = Router();

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

authRegistry.registerPath({
  method: "post",
  path: "/auth/register",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: registerSchema,
        },
      },
    },
  },
  responses: createApiResponse(authResponseSchema, "User registered", 201, [400, 422, 500]),
});

authRouter.post("/register", validateBody(registerSchema), (req, res) =>
  authController.register(req as TypedRequest<RegisterBody>, res),
);

authRegistry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: loginSchema,
        },
      },
    },
  },
  responses: createApiResponse(authResponseSchema, "User logged in", 200, [400, 422, 500]),
});

authRouter.post("/login", validateBody(loginSchema), (req, res) =>
  authController.login(req as TypedRequest<LoginBody>, res),
);

authRegistry.registerPath({
  method: "post",
  path: "/auth/refresh-token",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: refreshTokenSchema,
        },
      },
    },
  },
  responses: createApiResponse(refreshTokenResponseSchema, "Token refreshed", 200, [400, 422, 500]),
});

authRouter.post("/refresh-token", validateBody(refreshTokenSchema), (req, res) =>
  authController.refreshToken(req as TypedRequest<RefreshTokenBody>, res),
);

authRegistry.registerPath({
  method: "post",
  path: "/auth/logout",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: refreshTokenSchema,
        },
      },
    },
  },
  responses: createApiResponse(logoutResponseSchema, "User logged out", 200, [400, 422, 500]),
});

authRouter.post("/logout", validateBody(refreshTokenSchema), (req, res) =>
  authController.logout(req as TypedRequest<RefreshTokenBody>, res),
);

authRegistry.registerPath({
  method: "post",
  path: "/auth/revoke-all",
  tags: ["Auth"],
  responses: createApiResponse(logoutResponseSchema, "All sessions revoked", 200, [401, 403, 500]),
  security: [{ bearerAuth: [] }],
});

authRouter.post("/revoke-all", authenticate, (req, res) =>
  authController.revokeAll(req as AuthenticatedRequest, res),
);

authRegistry.registerPath({
  method: "get",
  path: "/auth/profile",
  tags: ["Auth"],
  responses: createApiResponse(profileResponseSchema, "User profile", 200, [401, 403, 500]),
  security: [{ bearerAuth: [] }],
});

authRouter.get("/profile", authenticate, (req, res) =>
  authController.getProfile(req as AuthenticatedRequest, res),
);

authRegistry.registerPath({
  method: "post",
  path: "/auth/verify-email",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: emailVerificationSchema,
        },
      },
    },
  },
  responses: createApiResponse(successResponseSchema, "Email verified", 200, [400, 422, 500]),
});

authRouter.post("/verify-email", validateBody(emailVerificationSchema), (req, res) =>
  authController.verifyEmail(req as TypedRequest<EmailVerificationBody>, res),
);

authRegistry.registerPath({
  method: "post",
  path: "/auth/resend-verification",
  tags: ["Auth"],
  responses: createApiResponse(successResponseSchema, "Verification email resent", 200, [401, 403, 500]),
  security: [{ bearerAuth: [] }],
});

authRouter.post("/resend-verification", authenticate, (req, res) =>
  authController.resendVerification(req as AuthenticatedRequest, res),
);

authRegistry.registerPath({
  method: "post",
  path: "/auth/forgot-password",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: forgotPasswordSchema,
        },
      },
    },
  },
  responses: createApiResponse(successResponseSchema, "Password reset email sent", 200, [400, 422, 500]),
});

authRouter.post("/forgot-password", validateBody(forgotPasswordSchema), (req, res) =>
  authController.forgotPassword(req as TypedRequest<ForgotPasswordBody>, res),
);

authRegistry.registerPath({
  method: "post",
  path: "/auth/reset-password",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: resetPasswordSchema,
        },
      },
    },
  },
  responses: createApiResponse(successResponseSchema, "Password reset successfully", 200, [400, 422, 500]),
});

authRouter.post("/reset-password", validateBody(resetPasswordSchema), (req, res) =>
  authController.resetPassword(req as TypedRequest<ResetPasswordBody>, res),
);
