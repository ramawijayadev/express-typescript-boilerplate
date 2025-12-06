import type { AuthenticatedRequest } from "@/core/http/types";
import { ok } from "@/shared/http/api-response";

import type { UsersService } from "./users.service";
import type { UpdateUserBody } from "./users.types";
import type { Response } from "express";

export class UsersController {
  constructor(private readonly service: UsersService) {}

  /**
   * Get authenticated user profile.
   */
  async me(req: AuthenticatedRequest, res: Response) {
    const userId = req.user.id;
    const result = await this.service.getProfile(userId);
    return ok(res, result);
  }

  /**
   * Update authenticated user profile.
   */
  async updateMe(req: AuthenticatedRequest<UpdateUserBody>, res: Response) {
    const userId = req.user.id;
    const result = await this.service.updateProfile(userId, req.body);
    return ok(res, result);
  }
}
