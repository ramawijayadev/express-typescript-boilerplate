import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";

import { authConfig } from "@/config/auth";

export interface TokenPayload {
  userId: number;
  jti?: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, authConfig.jwt.secret, {
    expiresIn: authConfig.jwt.accessExpiration,
  });
}

export function generateRefreshToken(payload: TokenPayload): string {
  const jti = randomUUID();
  return jwt.sign({ ...payload, jti }, authConfig.jwt.secret, {
    expiresIn: authConfig.jwt.refreshExpiration,
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, authConfig.jwt.secret) as TokenPayload;
}
