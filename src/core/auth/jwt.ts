import jwt from "jsonwebtoken";

import { authConfig } from "@/config/auth";

interface TokenPayload {
  userId: number;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, authConfig.jwt.secret, {
    expiresIn: authConfig.jwt.accessExpiration,
  });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, authConfig.jwt.secret, {
    expiresIn: authConfig.jwt.refreshExpiration,
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, authConfig.jwt.secret) as TokenPayload;
}
