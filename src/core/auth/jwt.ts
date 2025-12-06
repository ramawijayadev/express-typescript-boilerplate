import { randomUUID } from "node:crypto";

import jwt from "jsonwebtoken";

import { authConfig } from "@/config/auth";

export interface TokenPayload {
  userId: number;
  jti?: string;
  exp?: number;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign({ ...payload }, authConfig.jwt.secret as jwt.Secret, {
    expiresIn: authConfig.jwt.accessExpiration as any,
  });
}

export function generateRefreshToken(payload: TokenPayload): string {
  const jti = randomUUID();
  return jwt.sign({ ...payload, jti }, authConfig.jwt.secret as jwt.Secret, {
    expiresIn: authConfig.jwt.refreshExpiration as any,
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, authConfig.jwt.secret as jwt.Secret) as TokenPayload;
}
