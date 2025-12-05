import { z } from "zod";

import { loginSchema, refreshTokenSchema, registerSchema } from "./auth.schemas";

export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
export type RefreshTokenBody = z.infer<typeof refreshTokenSchema>;

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
}

export interface LogoutResponse {
  message: string;
}
