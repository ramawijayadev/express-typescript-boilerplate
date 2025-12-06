import { StatusCodes } from "http-status-codes";
import { AppError } from "@/shared/errors/AppError";
import { toUserResponse } from "./users.mappers";
import type { UsersRepository } from "./users.repository";
import type { UpdateUserBody, UserResponse } from "./users.types";

export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  async getProfile(userId: number): Promise<UserResponse> {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, "User not found");
    }
    return toUserResponse(user);
  }

  async updateProfile(userId: number, data: UpdateUserBody): Promise<UserResponse> {
    const user = await this.repo.update(userId, data);
    return toUserResponse(user);
  }
}
