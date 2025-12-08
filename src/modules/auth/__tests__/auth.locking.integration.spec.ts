/**
 * Integration tests for Account Locking mechanism.
 */
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { createApp } from "@/app/app";
import { authConfig } from "@/config/auth";
import { hashPassword } from "@/core/auth/password";
import { db } from "@/core/database/connection";

describe("Auth Account Locking (Integration)", () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(async () => {
    app = createApp();
  });

  const createUser = async () => {
    const passwordHash = await hashPassword("Password123");
    return db().user.create({
      data: {
        name: "Lock Test User",
        email: "lock_test@example.com",
        password: passwordHash,
      },
    });
  };

  it("should increment failedLoginAttempts on wrong password", async () => {
    await createUser();

    const response = await request(app).post("/api/v1/auth/login").send({
      email: "lock_test@example.com",
      password: "WrongPassword",
    });

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);

    const user = await db().user.findUnique({ where: { email: "lock_test@example.com" } });
    expect(user?.failedLoginAttempts).toBe(1);
    expect(user?.lockedUntil).toBeNull();
  });

  it(`should lock account after ${authConfig.locking.maxAttempts} failed attempts`, async () => {
    await createUser();

    for (let i = 0; i < authConfig.locking.maxAttempts; i++) {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: "lock_test@example.com",
        password: "WrongPassword",
      });
      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    }

    const user = await db().user.findUnique({ where: { email: "lock_test@example.com" } });
    expect(user?.failedLoginAttempts).toBe(authConfig.locking.maxAttempts);
    expect(user?.lockedUntil).not.toBeNull();

    expect(new Date(user!.lockedUntil!).getTime()).toBeGreaterThan(Date.now());
  });

  it("should reject login when account is locked even with correct password", async () => {
    const user = await createUser();

    await db().user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: authConfig.locking.maxAttempts,
        lockedUntil: new Date(Date.now() + 1000 * 60 * 30), // 30 mins future
      },
    });

    const response = await request(app).post("/api/v1/auth/login").send({
      email: "lock_test@example.com",
      password: "Password123",
    });

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(response.body.message).toMatch(/Account is locked/);
  });

  it("should allow login after lock expires", async () => {
    const user = await createUser();

    await db().user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: authConfig.locking.maxAttempts,
        lockedUntil: new Date(Date.now() - 1000), // Past
      },
    });

    const response = await request(app).post("/api/v1/auth/login").send({
      email: "lock_test@example.com",
      password: "Password123",
    });

    expect(response.status).toBe(StatusCodes.OK);

    const updatedUser = await db().user.findUnique({ where: { id: user.id } });
    expect(updatedUser?.failedLoginAttempts).toBe(0);
    expect(updatedUser?.lockedUntil).toBeNull();
    expect(updatedUser?.lastLoginAt).not.toBeNull();
  });

  it("should reset failed attempts on successful login before limit", async () => {
    const user = await createUser();

    await request(app).post("/api/v1/auth/login").send({
      email: "lock_test@example.com",
      password: "WrongPassword",
    });

    const userBefore = await db().user.findUnique({ where: { id: user.id } });
    expect(userBefore?.failedLoginAttempts).toBe(1);

    const response = await request(app).post("/api/v1/auth/login").send({
      email: "lock_test@example.com",
      password: "Password123",
    });

    expect(response.status).toBe(StatusCodes.OK);

    const userAfter = await db().user.findUnique({ where: { id: user.id } });
    expect(userAfter?.failedLoginAttempts).toBe(0);
    expect(userAfter?.lockedUntil).toBeNull();
  });
});
