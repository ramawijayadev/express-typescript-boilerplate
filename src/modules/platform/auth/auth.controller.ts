import { NextFunction, Request, Response } from "express";

import { clientError, created, ok } from "@/shared/http/api-response";
import type { AuthService } from "./auth.service";
import type { LoginBody, RefreshTokenBody, RegisterBody } from "./auth.types";

export class AuthController {
  constructor(private readonly service: AuthService) {}

  async register(req: Request<unknown, unknown, RegisterBody>, res: Response) {
    const result = await this.service.register(req.body);
    return created(res, result);
  }

  async login(req: Request<unknown, unknown, LoginBody>, res: Response) {
    const result = await this.service.login(req.body);
    return ok(res, result);
  }

  async refreshToken(req: Request<unknown, unknown, RefreshTokenBody>, res: Response) {
    const result = await this.service.refreshToken(req.body.refreshToken);
    return ok(res, result);
  }

  async getProfile(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error("User ID missing from request");
    }

    const result = await this.service.getProfile(userId);
    return ok(res, result);
  }

  async logout(_req: Request, res: Response) {
    return ok(res, {});
  }
}
