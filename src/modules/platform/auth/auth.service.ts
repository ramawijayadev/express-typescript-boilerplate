import { StatusCodes } from "http-status-codes";

import { authConfig } from "@/config/auth";
import { generateAccessToken, generateRefreshToken, verifyToken } from "@/core/auth/jwt";
import { hashPassword, verifyPassword } from "@/core/auth/password";
import { hashToken } from "@/core/auth/hash";
import { randomBytes } from "node:crypto";
import { AppError } from "@/shared/errors/AppError";
import { jobQueue } from "@/core/queue";
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
    await this.sendVerificationEmail(user);


    return this.createSession(user, meta);
  }

  async login(data: LoginBody, meta?: { ip?: string; userAgent?: string }): Promise<AuthResponse> {
    const user = await this.repo.findByEmail(data.email);
    if (!user ||!user.password) {
      this.throwInvalidCredentials();
    }

    if (!user.isActive) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Account is disabled");
    }


    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        `Account is locked. Try again after ${user.lockedUntil.toISOString()}`,
      );
    }

    const isValidPassword = await verifyPassword(user.password, data.password);
    if (!isValidPassword) {
      const updatedUser = await this.repo.incrementFailedLogin(user.id);

      if (updatedUser.failedLoginAttempts >= authConfig.locking.maxAttempts) {
        const lockDurationMs = authConfig.locking.durationMinutes * 60 * 1000;
        const lockedUntil = new Date(Date.now() + lockDurationMs);
        await this.repo.lockUser(user.id, lockedUntil);
      }

      this.throwInvalidCredentials();
    }

    await this.repo.resetLoginStats(user.id);

    return this.createSession(user, meta);
  }

  private async createSession(
    user: { id: number; name: string; email: string },
    meta?: { ip?: string; userAgent?: string },
  ): Promise<AuthResponse> {
    const accessToken = generateAccessToken({ userId: user.id });
    const refreshToken = generateRefreshToken({ userId: user.id });

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

  async sendVerificationEmail(user: { id: number; email: string }) {
    const token = randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const expiresAt = new Date(
      Date.now() + authConfig.emailVerificationExpirationHours * 60 * 60 * 1000,
    );

    await this.repo.createEmailVerificationToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    await jobQueue.enqueueEmailVerification({
      userId: user.id,
      email: user.email,
      token,
    });
  }

  async resendVerification(userId: number) {
    const user = await this.repo.findById(userId);
    if (!user) {
      return; // Fail silently or returns 200 as per requirements
    }

    if (user.emailVerifiedAt) {
      return; // Already verified
    }

    await this.sendVerificationEmail(user);
  }

  async verifyEmail(token: string) {
    const tokenHash = hashToken(token);
    const verificationToken = await this.repo.findEmailVerificationToken(tokenHash);

    if (!verificationToken) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Invalid or expired verification token");
    }

    if (verificationToken.usedAt) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Token already used");
    }

    if (verificationToken.expiresAt < new Date()) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Token expired");
    }

    await this.repo.verifyUserEmail(verificationToken.userId);
    await this.repo.markEmailVerificationTokenUsed(verificationToken.id);
  }

  async forgotPassword(email: string) {
    const user = await this.repo.findByEmail(email);
    if (!user || !user.isActive) {
      return; // Always return success
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const expiresAt = new Date(
      Date.now() + authConfig.passwordResetExpirationMinutes * 60 * 1000,
    );

    await this.repo.createPasswordResetToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    await jobQueue.enqueuePasswordReset({
      userId: user.id,
      email: user.email,
      token,
    });
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = hashToken(token);
    const resetToken = await this.repo.findPasswordResetToken(tokenHash);

    if (!resetToken) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Invalid or expired reset token");
    }

    if (resetToken.usedAt) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Token already used");
    }

    if (resetToken.expiresAt < new Date()) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Token expired");
    }

    const passwordHash = await hashPassword(newPassword);

    await this.repo.updatePassword(resetToken.userId, passwordHash);
    await this.repo.markPasswordResetTokenUsed(resetToken.id);
    await this.repo.revokeAllUserSessions(resetToken.userId);
  }
  private throwInvalidCredentials(): never {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }
}
