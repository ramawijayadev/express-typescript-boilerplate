import { randomUUID } from "node:crypto";

import jwt from "jsonwebtoken";

import { authConfig } from "@/config/auth";

/**
 * Payload structure for JWT tokens.
 */
export interface TokenPayload {
  userId: number;
  jti?: string;
  exp?: number;
}

/**
 * Generates a short-lived Access Token.
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign({ ...payload }, authConfig.jwt.secret as jwt.Secret, {
    expiresIn: authConfig.jwt.accessExpiration as NonNullable<jwt.SignOptions["expiresIn"]>,
  });
}

/**
 * Generates a long-lived Refresh Token.
 * Includes a UUID (jti) to allow unique identification and revocation.
 */
export function generateRefreshToken(payload: TokenPayload): string {
  const jti = randomUUID();
  return jwt.sign({ ...payload, jti }, authConfig.jwt.secret as jwt.Secret, {
    expiresIn: authConfig.jwt.refreshExpiration as NonNullable<jwt.SignOptions["expiresIn"]>,
  });
}

/**
 * Verifies a JWT token and returns its payload.
 * Throws if the token is invalid or expired.
 */
export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, authConfig.jwt.secret as jwt.Secret);
  if (typeof decoded === "string") {
    throw new Error("Invalid token payload");
  }
  return decoded as TokenPayload;
}
