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
 * @param payload - Data to embed in the token.
 * @returns Signed JWT string.
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign({ ...payload }, authConfig.jwt.secret as jwt.Secret, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expiresIn: authConfig.jwt.accessExpiration as any,
  });
}

/**
 * Generates a long-lived Refresh Token.
 * Includes a UUID (jti) to allow unique identification and revocation.
 * @param payload - Data to embed.
 * @returns Signed JWT string.
 */
export function generateRefreshToken(payload: TokenPayload): string {
  const jti = randomUUID();
  return jwt.sign({ ...payload, jti }, authConfig.jwt.secret as jwt.Secret, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expiresIn: authConfig.jwt.refreshExpiration as any,
  });
}

/**
 * Verifies a JWT token and returns its payload.
 * Throws if the token is invalid or expired.
 */
export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, authConfig.jwt.secret as jwt.Secret) as TokenPayload;
}
