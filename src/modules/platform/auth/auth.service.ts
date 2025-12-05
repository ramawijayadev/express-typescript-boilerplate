import { StatusCodes } from "http-status-codes";

import { generateAccessToken, generateRefreshToken, verifyToken } from "@/core/auth/jwt";
import { hashPassword, verifyPassword } from "@/core/auth/password";
import { hashToken } from "@/core/auth/hash";
import { AppError } from "@/shared/errors/AppError";
import type { AuthRepository } from "./auth.repository";
import type {
  AuthResponse,
  LoginBody,
  ProfileResponse,
  RefreshTokenResponse,
  RegisterBody,
} from "./auth.types";

export class AuthService {
  constructor(private readonly repo: AuthRepository) {}

  async register(
    data: RegisterBody,
    meta?: { ip?: string; userAgent?: string },
  ): Promise<AuthResponse> {
    const existingUser = await this.repo.findByEmail(data.email);
    if (existingUser) {
      throw new AppError(StatusCodes.CONFLICT, "Email already registered");
    }

    const passwordHash = await hashPassword(data.password);
    const user = await this.repo.create({ ...data, passwordHash });

    return this.createSession(user, meta);
  }

  async login(data: LoginBody, meta?: { ip?: string; userAgent?: string }): Promise<AuthResponse> {
    const user = await this.repo.findByEmail(data.email);
    if (!user) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
    }

    if (!user.password) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
    }

    if (!user.isActive) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Account is disabled");
    }

    const isValidPassword = await verifyPassword(user.password, data.password);
    if (!isValidPassword) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
    }

    return this.createSession(user, meta);
  }

  private async createSession(
    user: { id: number; name: string; email: string },
    meta?: { ip?: string; userAgent?: string },
  ): Promise<AuthResponse> {
    const accessToken = generateAccessToken({ userId: user.id });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Decode to get expiration time
    const decoded = verifyToken(refreshToken);
    const expiresAt = new Date((decoded.exp || 0) * 1000);

    const refreshTokenHash = hashToken(refreshToken);

    await this.repo.createSession({
      userId: user.id,
      refreshTokenHash,
      expiresAt,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ip,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async refreshToken(token: string): Promise<RefreshTokenResponse> {
    try {
      const payload = verifyToken(token);
      const tokenHash = hashToken(token);

      const session = await this.repo.findSessionByHash(tokenHash);
      if (!session) {
        // Token is valid JWT but not in DB -> possibly revoked or rotated
        throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid refresh token");
      }

      if (!session.user.isActive) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "Account is disabled");
      }

      // Rotate token
      const newRefreshToken = generateRefreshToken({ userId: session.userId });
      const newDecoded = verifyToken(newRefreshToken);
      const newExpiresAt = new Date((newDecoded.exp || 0) * 1000);
      const newHash = hashToken(newRefreshToken);

      await this.repo.updateSessionHash(session.id, newHash, newExpiresAt);
      const newAccessToken = generateAccessToken({ userId: session.userId });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid refresh token");
    }
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = hashToken(refreshToken);
    const session = await this.repo.findSessionByHash(tokenHash);
    if (!session) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid refresh token");
    }
    await this.repo.revokeSession(session.id);
  }

  async revokeAllSessions(userId: number): Promise<void> {
    await this.repo.revokeAllUserSessions(userId);
  }

  async getProfile(userId: number): Promise<ProfileResponse> {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, "User not found");
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }
}
