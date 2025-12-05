import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Router } from "express";

import { authenticate } from "@/core/http/middlewares/authenticate";
import { validateBody } from "@/core/http/validation.middleware";
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
  responses: createApiResponse(authResponseSchema, "User registered"),
});

authRouter.post("/register", validateBody(registerSchema), (req, res) =>
  authController.register(req, res),
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
  responses: createApiResponse(authResponseSchema, "User logged in"),
});

authRouter.post("/login", validateBody(loginSchema), (req, res) => authController.login(req, res));

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
  responses: createApiResponse(refreshTokenResponseSchema, "Token refreshed"),
});

authRouter.post("/refresh-token", validateBody(refreshTokenSchema), (req, res) =>
  authController.refreshToken(req, res),
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
  responses: createApiResponse(logoutResponseSchema, "User logged out"),
});

authRouter.post("/logout", validateBody(refreshTokenSchema), (req, res) =>
  authController.logout(req, res),
);

authRegistry.registerPath({
  method: "post",
  path: "/auth/revoke-all",
  tags: ["Auth"],
  responses: createApiResponse(logoutResponseSchema, "All sessions revoked"),
});

authRouter.post("/revoke-all", authenticate, (req, res) => authController.revokeAll(req, res));

authRegistry.registerPath({
  method: "get",
  path: "/auth/profile",
  tags: ["Auth"],
  responses: createApiResponse(profileResponseSchema, "User profile"),
});

authRouter.get("/profile", authenticate, (req, res) => authController.getProfile(req, res));

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
  responses: createApiResponse(successResponseSchema, "Email verified"),
});

authRouter.post("/verify-email", validateBody(emailVerificationSchema), (req, res) =>
  authController.verifyEmail(req, res),
);

authRegistry.registerPath({
  method: "post",
  path: "/auth/resend-verification",
  tags: ["Auth"],
  responses: createApiResponse(successResponseSchema, "Verification email resent"),
});

authRouter.post("/resend-verification", authenticate, (req, res) =>
  authController.resendVerification(req, res),
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
  responses: createApiResponse(successResponseSchema, "Password reset email sent"),
});

authRouter.post("/forgot-password", validateBody(forgotPasswordSchema), (req, res) =>
  authController.forgotPassword(req, res),
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
  responses: createApiResponse(successResponseSchema, "Password reset successfully"),
});

authRouter.post("/reset-password", validateBody(resetPasswordSchema), (req, res) =>
  authController.resetPassword(req, res),
);
