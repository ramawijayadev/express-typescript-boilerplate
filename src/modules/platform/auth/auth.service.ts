import { randomBytes } from "node:crypto";

import { StatusCodes } from "http-status-codes";

import { authConfig } from "@/config/auth";
import { hashToken } from "@/core/auth/hash";
import { generateAccessToken, generateRefreshToken, verifyToken } from "@/core/auth/jwt";
import { hashPassword, verifyPassword } from "@/core/auth/password";
import { jobQueue } from "@/core/queue";
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
  /**
   * Creates an instance of AuthService.
   * @param repo - The auth repository.
   */
  constructor(private readonly repo: AuthRepository) {}

  /**
   * Registers a new user.
   *
   * @param data - The registration data (name, email, password).
   * @param meta - Metadata about the request (IP, User Agent).
   * @returns A promise that resolves to the auth response (tokens and user info).
   * @throws {AppError} 409 - If the email is already registered.
   */
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

  /**
   * Authenticates a user.
   *
   * @param data - The login credentials (email, password).
   * @param meta - Metadata about the request (IP, User Agent).
   * @returns A promise that resolves to the auth response.
   * @throws {AppError} 401 - If credentials are invalid, account is disabled, or locked.
   */
  async login(data: LoginBody, meta?: { ip?: string; userAgent?: string }): Promise<AuthResponse> {
    const user = await this.repo.findByEmail(data.email);

    // SECURITY: Always verify password to prevent timing attacks that could reveal valid emails
    // Use a dummy hash if user doesn't exist to maintain constant-time response
    const passwordHash =
      user?.password ||
      "$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHR2YWx1ZQ$dummy"; // dummy argon2 hash

    const isValidPassword = await verifyPassword(passwordHash, data.password);

    // Check user existence and validity AFTER password verification
    if (!user || !user.password || !isValidPassword) {
      // Increment failed login attempts if user exists
      if (user) {
        const updatedUser = await this.repo.incrementFailedLogin(user.id);

        // Lock account if too many failed attempts
        if (updatedUser.failedLoginAttempts >= authConfig.locking.maxAttempts) {
          const lockDurationMs = authConfig.locking.durationMinutes * 60 * 1000;
          const lockedUntil = new Date(Date.now() + lockDurationMs);
          await this.repo.lockUser(user.id, lockedUntil);
        }
      }

      this.throwInvalidCredentials();
    }

    // Check if account is active
    if (!user.isActive) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Account is disabled");
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        `Account is locked. Try again after ${user.lockedUntil.toISOString()}`,
      );
    }

    // Reset failed login attempts on successful login
    await this.repo.resetLoginStats(user.id);

    return this.createSession(user, meta);
  }

  /**
   * Creates a new session using user details.
   *
   * @param user - The user object.
   * @param meta - Metadata about the request (IP, User Agent).
   * @returns The generated auth tokens and user info.
   */
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
      userAgent: meta?.userAgent ?? null,
      ipAddress: meta?.ip ?? null,
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

  /**
   * Refreshes the access token using a valid refresh token.
   * Rotates the refresh token for security.
   *
   * @param token - The current refresh token.
   * @returns A promise that resolves to the new access and refresh tokens.
   * @throws {AppError} 401 - If the token is invalid, used, or revoked.
   */
  async refreshToken(token: string): Promise<RefreshTokenResponse> {
    try {
      verifyToken(token);
      const tokenHash = hashToken(token);

      const session = await this.repo.findSessionByHash(tokenHash);
      if (!session) {
        // Token is valid JWT but not in DB -> possibly revoked or rotated
        throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid refresh token");
      }

      // SECURITY: Check if session has expired based on database timestamp
      if (session.expiresAt < new Date()) {
        await this.repo.revokeSession(session.id); // Clean up expired session
        throw new AppError(StatusCodes.UNAUTHORIZED, "Session expired");
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
    } catch {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid refresh token");
    }
  }

  /**
   * Logs out a user by revoking the refresh token session.
   *
   * @param refreshToken - The refresh token to revoke.
   * @throws {AppError} 401 - If the token is invalid or not found.
   */
  async logout(refreshToken: string): Promise<void> {
    const tokenHash = hashToken(refreshToken);
    const session = await this.repo.findSessionByHash(tokenHash);
    if (!session) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid refresh token");
    }
    await this.repo.revokeSession(session.id);
  }

  /**
   * Revokes all sessions for a specific user.
   *
   * @param userId - The ID of the user.
   */
  async revokeAllSessions(userId: number): Promise<void> {
    await this.repo.revokeAllUserSessions(userId);
  }

  /**
   * Retrieves the profile of a user.
   *
   * @param userId - The ID of the user.
   * @returns A promise that resolves to the user profile.
   * @throws {AppError} 404 - If the user is not found.
   */
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

  /**
   * Sends a verification email to the user.
   *
   * @param user - The user to send the email to.
   */
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

  /**
   * Resends the verification email if not already verified.
   *
   * @param userId - The ID of the user.
   */
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

  /**
   * Verifies a user's email using a token.
   *
   * @param token - The verification token.
   * @throws {AppError} 400 - If token is invalid, expired, or used.
   */
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

  /**
   * Initiates the password reset process.
   *
   * @param email - The email of the user who forgot their password.
   */
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

  /**
   * Resets the user's password using a valid token.
   *
   * @param token - The password reset token.
   * @param newPassword - The new password.
   * @throws {AppError} 400 - If token is invalid, expired, or used.
   */
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
