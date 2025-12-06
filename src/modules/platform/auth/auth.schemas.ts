import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const registerSchema = z
  .object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: passwordSchema,
  })
  .openapi("RegisterInput");

export const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string(),
  })
  .openapi("LoginInput");

export const refreshTokenSchema = z
  .object({
    refreshToken: z.string(),
  })
  .openapi("RefreshTokenInput");

export const authResponseSchema = z
  .object({
    user: z.object({
      id: z.number(),
      name: z.string(),
      email: z.string(),
    }),
    tokens: z.object({
      accessToken: z.string(),
      refreshToken: z.string(),
    }),
  })
  .openapi("AuthResponse");

export const profileResponseSchema = z
  .object({
    user: z.object({
      id: z.number(),
      name: z.string(),
      email: z.string(),
      createdAt: z.date(),
    }),
  })
  .openapi("ProfileResponse");

export const refreshTokenResponseSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string(),
  })
  .openapi("RefreshTokenResponse");

export const logoutResponseSchema = z.object({}).openapi("LogoutResponse");

export const emailVerificationSchema = z
  .object({
    token: z.string(),
  })
  .openapi("EmailVerificationInput");

export const forgotPasswordSchema = z
  .object({
    email: z.string().email(),
  })
  .openapi("ForgotPasswordInput");

export const resetPasswordSchema = z
  .object({
    token: z.string(),
    newPassword: passwordSchema,
  })
  .openapi("ResetPasswordInput");

export const successResponseSchema = z
  .object({
    message: z.string(),
  })
  .openapi("SuccessResponse");
