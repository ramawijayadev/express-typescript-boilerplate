import { PrismaClient } from "@/generated/prisma/client";
import type { UpdateUserBody, UserResponse } from "./users.types";

export class UsersRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<UserResponse | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
      },
    });
    return user;
  }

  async update(id: number, data: UpdateUserBody): Promise<UserResponse> {
    const user = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
      },
    });
    return user;
  }
}
