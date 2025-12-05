import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { AppError } from "@/shared/errors/AppError";
import { clientError, created, ok } from "@/shared/http/api-response";
import type { AuthService } from "./auth.service";
import type { LoginBody, RefreshTokenBody, RegisterBody } from "./auth.types";

export class AuthController {
  constructor(private readonly service: AuthService) {}

  async register(req: Request<unknown, unknown, RegisterBody>, res: Response) {
    const meta = {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    };
    const result = await this.service.register(req.body, meta);
    return created(res, result);
  }

  async login(req: Request<unknown, unknown, LoginBody>, res: Response) {
    const meta = {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    };
    const result = await this.service.login(req.body, meta);
    return ok(res, result);
  }

  async refreshToken(req: Request<unknown, unknown, RefreshTokenBody>, res: Response) {
    const result = await this.service.refreshToken(req.body.refreshToken);
    return ok(res, result);
  }

  async getProfile(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "User ID missing from request");
    }

    const result = await this.service.getProfile(userId);
    return ok(res, result);
  }

  async logout(req: Request<unknown, unknown, RefreshTokenBody>, res: Response) {
    await this.service.logout(req.body.refreshToken);
    return ok(res, { message: "Logged out successfully" });
  }

  async revokeAll(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "User ID missing from request");
    }
    await this.service.revokeAllSessions(userId);
    return ok(res, { message: "All sessions revoked" });
  }
}
