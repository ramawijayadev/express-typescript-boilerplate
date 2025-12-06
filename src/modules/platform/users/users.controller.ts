import type { Request, Response } from "express";
import { ok } from "@/shared/http/api-response";
import type { UsersService } from "./users.service";
import type { UpdateUserBody } from "./users.types";

export class UsersController {
  constructor(private readonly service: UsersService) {}

  async me(req: Request, res: Response) {
    // Assuming req.user is populated by Auth Middleware.
    // We cast to any for now since we haven't updated the global Express type definition in this specific task.
    const userId = (req as any).user?.id; 
    const result = await this.service.getProfile(Number(userId));
    return ok(res, result);
  }

  async updateMe(req: Request<unknown, unknown, UpdateUserBody>, res: Response) {
    const userId = (req as any).user?.id;
    const result = await this.service.updateProfile(Number(userId), req.body);
    return ok(res, result);
  }
}
