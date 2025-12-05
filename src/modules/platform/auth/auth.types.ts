import { z } from "zod";

import {
  emailVerificationSchema,
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
} from "./auth.schemas";

export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
export type RefreshTokenBody = z.infer<typeof refreshTokenSchema>;
export type EmailVerificationBody = z.infer<typeof emailVerificationSchema>;
export type ForgotPasswordBody = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordBody = z.infer<typeof resetPasswordSchema>;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
  };
  tokens: AuthTokens;
}

export interface ProfileResponse {
  user: {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
  };
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LogoutResponse {
  message: string;
}
