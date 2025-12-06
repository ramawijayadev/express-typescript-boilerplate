import type { AuthenticatedRequest } from "@/core/http/types";
import { ok } from "@/shared/http/api-response";

import type { UsersService } from "./users.service";
import type { UpdateUserBody } from "./users.types";
import type { Response } from "express";

export class UsersController {
  /**
   * Creates an instance of UsersController.
   * @param service - The users service.
   */
  constructor(private readonly service: UsersService) {}

  /**
   * Gets the authenticated user's profile.
   *
   * @param req - Authenticated request.
   * @param res - Response.
   */
  async me(req: AuthenticatedRequest, res: Response) {
    const userId = req.user.id;
    const result = await this.service.getProfile(userId);
    return ok(res, result);
  }

  /**
   * Updates the authenticated user's profile.
   *
   * @param req - Authenticated request containing update data.
   * @param res - Response.
   */
  async updateMe(req: AuthenticatedRequest<UpdateUserBody>, res: Response) {
    const userId = req.user.id;
    const result = await this.service.updateProfile(userId, req.body);
    return ok(res, result);
  }
}
