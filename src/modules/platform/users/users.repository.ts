import type { User } from "@/generated/prisma";
import type { PrismaClient } from "@/generated/prisma/client";

import type { UpdateUserBody } from "./users.types";

export class UsersRepository {
  /**
   * Creates an instance of UsersRepository.
   * @param prisma - The Prisma client.
   */
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Finds a user by their ID.
   *
   * @param id - The user ID.
   * @returns A promise that resolves to the user if found, or null otherwise.
   */
  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Updates a user's details.
   *
   * @param id - The user ID.
   * @param data - The data to update.
   * @returns A promise that resolves to the updated user.
   */
  async update(id: number, data: UpdateUserBody): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
