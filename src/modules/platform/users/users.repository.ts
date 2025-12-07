import type { User } from "@prisma/client";
import type { PrismaClient } from "@prisma/client/client";

import type { UpdateUserBody } from "./users.types";

export class UsersRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: number, data: UpdateUserBody): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
