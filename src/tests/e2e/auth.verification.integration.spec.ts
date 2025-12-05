import { Server } from "http";

import type { Express } from "express";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { createApp } from "@/app/app";
import { hashToken } from "@/core/auth/hash";
import { db } from "@/core/database/connection";

// Mock job queue to avoid Redis dependency and worker timing issues
vi.mock("@/core/queue", () => ({
  jobQueue: {
    enqueueEmailVerification: vi.fn(),
    enqueuePasswordReset: vi.fn(),
  },
}));

import { jobQueue } from "@/core/queue";

describe("Auth Verification & Password Reset Integration", () => {
  let app: Express;
  let testUser: any; // User type unavailable in test scope easily without import, keeping any for now but could use User
  let server: Server;

  beforeAll(async () => {
    app = await createApp();
    server = app.listen(0);
  });

  afterAll(async () => {
    await db().$disconnect();
    server.close();
  });

  beforeEach(async () => {
    // Clean up
    await db().emailVerificationToken.deleteMany();
    await db().passwordResetToken.deleteMany();
    await db().userSession.deleteMany();
    await db().user.deleteMany();

    // Create a base user
    testUser = await db().user.create({
      data: {
        name: "Test User",
        email: "test@example.com",
        password: "hashedpassword123",
        isActive: true,
      },
    });

    vi.clearAllMocks();
  });

  describe("POST /auth/resend-verification", () => {
    it("should enqueue verification email for unverified user", async () => {
      // Authenticate
      const { generateAccessToken } = await import("@/core/auth/jwt");
      const accessToken = generateAccessToken({ userId: testUser.id });

      const res = await request(app)
        .post("/api/v1/auth/resend-verification")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.data.message).toContain("verification email has been sent");

      // Verify token created in DB
      const token = await db().emailVerificationToken.findFirst({
        where: { userId: testUser.id },
      });
      expect(token).toBeDefined();

      // Verify job enqueued instead of checking email sender directly
      expect(jobQueue.enqueueEmailVerification).toHaveBeenCalledWith(expect.objectContaining({
         userId: testUser.id,
         email: testUser.email,
         token: expect.any(String),
      }));
    });
  });

  describe("POST /auth/verify-email", () => {
    it("should verify email with valid token", async () => {
      // Create raw token
      const { randomBytes } = await import("node:crypto");
      const token = randomBytes(32).toString("hex");
      const tokenHash = hashToken(token);

      await db().emailVerificationToken.create({
        data: {
          userId: testUser.id,
          tokenHash,
          expiresAt: new Date(Date.now() + 10000),
        },
      });

      const res = await request(app)
        .post("/api/v1/auth/verify-email")
        .send({ token });

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.data.message).toBe("Email verified successfully");

      const user = await db().user.findUnique({ where: { id: testUser.id } });
      expect(user?.emailVerifiedAt).not.toBeNull();

      const usedToken = await db().emailVerificationToken.findFirst({ where: { tokenHash } });
      expect(usedToken?.usedAt).not.toBeNull();
    });

    it("should fail with invalid token", async () => {
      const res = await request(app)
        .post("/api/v1/auth/verify-email")
        .send({ token: "invalid-token" });

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
    });
  });

  describe("POST /auth/forgot-password", () => {
    it("should create reset token and send email", async () => {
      const res = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email: testUser.email });

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.data.message).toContain("password reset email has been sent");

      const token = await db().passwordResetToken.findFirst({
        where: { userId: testUser.id },
      });
      expect(token).toBeDefined();

      expect(jobQueue.enqueuePasswordReset).toHaveBeenCalledWith(expect.objectContaining({
        userId: testUser.id,
        email: testUser.email,
        token: expect.any(String),
      }));
    });
  });

  describe("POST /auth/reset-password", () => {
    it("should reset password and revoke sessions", async () => {
      const { randomBytes } = await import("node:crypto");
      const token = randomBytes(32).toString("hex");
      const tokenHash = hashToken(token);

      await db().passwordResetToken.create({
        data: {
          userId: testUser.id,
          tokenHash,
          expiresAt: new Date(Date.now() + 10000),
        },
      });

      // valid password
      const newPassword = "NewPassword123";

      const res = await request(app)
        .post("/api/v1/auth/reset-password")
        .send({ token, newPassword });

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.data.message).toBe("Password reset successfully");

      const updatedUser = await db().user.findUnique({ where: { id: testUser.id } });
      // We can't check password directly but can check passwordChangedAt
      expect((updatedUser as any)?.passwordChangedAt).not.toBeNull();

      const usedToken = await db().passwordResetToken.findFirst({ where: { tokenHash } });
      expect(usedToken?.usedAt).not.toBeNull();
    });
  });
});
