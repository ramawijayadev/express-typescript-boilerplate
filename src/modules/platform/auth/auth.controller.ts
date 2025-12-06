import type { AuthenticatedRequest } from "@/core/http/types";
import { created, ok } from "@/shared/http/api-response";

import type { AuthService } from "./auth.service";
import type {
  EmailVerificationBody,
  ForgotPasswordBody,
  LoginBody,
  RefreshTokenBody,
  RegisterBody,
  ResetPasswordBody,
} from "./auth.types";
import type { Request, Response } from "express";


export class AuthController {
  constructor(private readonly service: AuthService) {}

  /**
   * Registers a new user.
   */
  async register(req: Request<unknown, unknown, RegisterBody>, res: Response) {
    const meta = {
      ip: req.ip ?? "127.0.0.1",
      userAgent: req.get("User-Agent") ?? "unknown",
    };
    const result = await this.service.register(req.body, meta);
    return created(res, result);
  }

  /**
   * Logs in a user.
   */
  async login(req: Request<unknown, unknown, LoginBody>, res: Response) {
    const meta = {
      ip: req.ip ?? "127.0.0.1",
      userAgent: req.get("User-Agent") ?? "unknown",
    };
    const result = await this.service.login(req.body, meta);
    return ok(res, result);
  }

  /**
   * Refreshes the access token.
   */
  async refreshToken(req: Request<unknown, unknown, RefreshTokenBody>, res: Response) {
    const result = await this.service.refreshToken(req.body.refreshToken);
    return ok(res, result);
  }

  /**
   * Gets the authenticated user's profile.
   */
  async getProfile(req: AuthenticatedRequest, res: Response) {
    const userId = req.user.id;

    const result = await this.service.getProfile(userId);
    return ok(res, result);
  }

  /**
   * Logs out the user (revokes refresh token).
   */
  async logout(req: Request<unknown, unknown, RefreshTokenBody>, res: Response) {
    await this.service.logout(req.body.refreshToken);
    return ok(res, { message: "Logged out successfully" });
  }

  /**
   * Revokes all sessions for the authenticated user.
   */
  async revokeAll(req: AuthenticatedRequest, res: Response) {
    const userId = req.user.id;
    await this.service.revokeAllSessions(userId);
    return ok(res, { message: "All sessions revoked" });
  }

  /**
   * Verifies a user's email.
   */
  async verifyEmail(req: Request<unknown, unknown, EmailVerificationBody>, res: Response) {
    await this.service.verifyEmail(req.body.token);
    return ok(res, { message: "Email verified successfully" });
  }

  /**
   * Resends the verification email.
   */
  async resendVerification(req: AuthenticatedRequest, res: Response) {
    const userId = req.user.id;
    if (userId) {
      await this.service.resendVerification(userId);
    }
    return ok(res, { message: "If your account exists and is not verified, a verification email has been sent." });
  }

  /**
   * Requests a password reset email.
   */
  async forgotPassword(req: Request<unknown, unknown, ForgotPasswordBody>, res: Response) {
    await this.service.forgotPassword(req.body.email);
    return ok(res, { message: "If your account exists, a password reset email has been sent." });
  }

  /**
   * Resets the password using a token.
   */
  async resetPassword(req: Request<unknown, unknown, ResetPasswordBody>, res: Response) {
    await this.service.resetPassword(req.body.token, req.body.newPassword);
    return ok(res, { message: "Password reset successfully" });
  }
}
