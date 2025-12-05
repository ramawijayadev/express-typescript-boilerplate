import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { createApp } from "@/app/app";
import { db } from "@/core/database/connection";
import { emailSender } from "@/core/mail/mailer";
import { hashToken } from "@/core/auth/hash";

describe("Auth Verification & Password Reset Integration", () => {
  let app: any;
  let testUser: any;
  let server: any;

  beforeAll(async () => {
    app = await createApp();
    // Allow queue to process
    server = app.listen(0);
  });

  afterAll(async () => {
    await db().$disconnect();
    server.close();
  });

  // Spy on email sender
  const sendEmailSpy = vi.spyOn(emailSender, "send").mockResolvedValue(undefined);

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
        password: "hashedpassword123", // Manually set or use service
        isActive: true,
      },
    });
    
    sendEmailSpy.mockClear();
  });

  describe("POST /auth/resend-verification", () => {
    it("should enqueue verification email for unverified user", async () => {
      // Authenticate
      const agent = request.agent(app);
      // We need to login or fake a session. 
      // Since we don't have login helper here easily without importing service,
      // let's manually create a session and attach cookie/header.
      // Or just use the register endpoint which auto-logs in? 
      // User is already created. Let's create a session manually.
      const session = await db().userSession.create({
        data: {
          userId: testUser.id,
          refreshTokenHash: "hash",
          expiresAt: new Date(Date.now() + 10000),
        },
      });
      // But middleware checks access token. 
      // We need to generate a valid access token.
      // Importing generateAccessToken from core/auth/jwt.
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

      // Verify email sent (async worker might take a moment, so use vitest waitFor or sleep)
      // Since worker runs in same process, it might happen quickly.
      await new Promise(r => setTimeout(r, 1000));
      expect(sendEmailSpy).toHaveBeenCalled();
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

      await new Promise(r => setTimeout(r, 1000));
      expect(sendEmailSpy).toHaveBeenCalled();
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
