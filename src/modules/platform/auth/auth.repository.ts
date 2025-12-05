import { db } from "@/core/database/connection";
import { RegisterBody } from "./auth.types";

export class AuthRepository {
  async create(data: Omit<RegisterBody, "password"> & { passwordHash: string }) {
    return db().user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.passwordHash,
      },
    });
  }

  async findByEmail(email: string) {
    return db().user.findUnique({
      where: { email },
    });
  }

  async findById(id: number) {
    return db().user.findUnique({
      where: { id },
    });
  }

  async createSession(data: {
    userId: number;
    refreshTokenHash: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }) {
    return db().userSession.create({
      data: {
        userId: data.userId,
        refreshTokenHash: data.refreshTokenHash,
        expiresAt: data.expiresAt,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
      },
    });
  }

  async findSessionByHash(hash: string) {
    return db().userSession.findFirst({
      where: {
        refreshTokenHash: hash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
  }

  async updateSessionHash(sessionId: number, newHash: string, expiresAt: Date) {
    return db().userSession.update({
      where: { id: sessionId },
      data: {
        refreshTokenHash: newHash,
        expiresAt,
        lastUsedAt: new Date(), // Wait, lastUsedAt is not in schema provided earlier? I'll check schema again.
      },
    });
  }

  async revokeSession(sessionId: number) {
    return db().userSession.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllUserSessions(userId: number) {
    return db().userSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async incrementFailedLogin(userId: number) {
    return db().user.update({
      where: { id: userId },
      data: { failedLoginAttempts: { increment: 1 } },
    });
  }

  async lockUser(userId: number, lockedUntil: Date) {
    return db().user.update({
      where: { id: userId },
      data: { lockedUntil },
    });
  }

  async resetLoginStats(userId: number) {
    return db().user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });
  }
}
