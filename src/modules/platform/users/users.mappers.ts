import type { User } from "@/generated/prisma";

/**
 * Maps a Prisma User entity to a safe API response format.
 * Excludes sensitive fields like password, locks, etc.
 */
export function toUserResponse(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
