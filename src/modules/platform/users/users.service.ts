import { StatusCodes } from "http-status-codes";

import { AppError } from "@/shared/errors/AppError";

import { toUserResponse } from "./users.mappers";

import type { UsersRepository } from "./users.repository";
import type { UpdateUserBody, UserResponse } from "./users.types";

export class UsersService {
  /**
   * Creates an instance of UsersService.
   * @param repo - The users repository.
   */
  constructor(private readonly repo: UsersRepository) {}

  /**
   * Retrieves the profile of a user.
   *
   * @param userId - The ID of the user.
   * @returns A promise that resolves to the user response.
   * @throws {AppError} 404 - If the user is not found.
   */
  async getProfile(userId: number): Promise<UserResponse> {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, "User not found");
    }
    return toUserResponse(user);
  }

  /**
   * Updates the profile of a user.
   *
   * @param userId - The ID of the user to update.
   * @param data - The data to update.
   * @returns A promise that resolves to the updated user response.
   */
  async updateProfile(userId: number, data: UpdateUserBody): Promise<UserResponse> {
    const user = await this.repo.update(userId, data);
    return toUserResponse(user);
  }
}
