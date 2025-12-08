import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { createApp } from "@/app/app";
import { hashToken } from "@/core/auth/hash";
import { hashPassword } from "@/core/auth/password";
import { db } from "@/core/database/connection";

import { AuthRepository } from "../auth.repository";

describe("Auth Session Management (Integrations)", () => {
  let app: ReturnType<typeof createApp>;
  const authRepository = new AuthRepository();

  beforeEach(async () => {
    app = createApp();
  });

  const createUser = async () => {
    const passwordHash = await hashPassword("Password123");
    return authRepository.create({
      name: "Session Test User",
      email: "session_test@example.com",
      passwordHash,
    });
  };

  describe("Login Session Creation", () => {
    it("should create a UserSession record upon login", async () => {
      await createUser();

      const response = await request(app).post("/api/v1/auth/login").send({
        email: "session_test@example.com",
        password: "Password123",
      });

      expect(response.status).toBe(StatusCodes.OK);
      const { refreshToken } = response.body.data.tokens;

      const session = await authRepository.findSessionByHash(hashToken(refreshToken));
      expect(session).toBeDefined();
      expect(session?.revokedAt).toBeNull();
    });
  });

  describe("Refresh Token Rotation", () => {
    it("should rotate refresh token and update session hash", async () => {
      await createUser();
      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: "session_test@example.com",
        password: "Password123",
      });
      const oldRefreshToken = loginRes.body.data.tokens.refreshToken;

      const refreshRes = await request(app)
        .post("/api/v1/auth/refresh-token")
        .send({ refreshToken: oldRefreshToken });

      expect(refreshRes.status).toBe(StatusCodes.OK);
      const newRefreshToken = refreshRes.body.data.refreshToken;
      expect(newRefreshToken).toBeDefined();
      expect(newRefreshToken).not.toBe(oldRefreshToken);

      const sessionOld = await authRepository.findSessionByHash(hashToken(oldRefreshToken));
      expect(sessionOld).toBeNull();

      const sessionNew = await authRepository.findSessionByHash(hashToken(newRefreshToken));
      expect(sessionNew).toBeDefined();
    });

    it("should fail when reusing an old refresh token", async () => {
      await createUser();
      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: "session_test@example.com",
        password: "Password123",
      });
      const firstRefreshToken = loginRes.body.data.tokens.refreshToken;

      await request(app)
        .post("/api/v1/auth/refresh-token")
        .send({ refreshToken: firstRefreshToken });

      const reuseRes = await request(app)
        .post("/api/v1/auth/refresh-token")
        .send({ refreshToken: firstRefreshToken });

      expect(reuseRes.status).toBe(StatusCodes.UNAUTHORIZED);
    });
  });

  describe("Logout", () => {
    it("should revoke the session", async () => {
      await createUser();
      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: "session_test@example.com",
        password: "Password123",
      });
      const { refreshToken } = loginRes.body.data.tokens;

      const logoutRes = await request(app).post("/api/v1/auth/logout").send({ refreshToken });

      expect(logoutRes.status).toBe(StatusCodes.OK);

      const session = await db().userSession.findFirst({
        where: { refreshTokenHash: hashToken(refreshToken) },
      });
      expect(session?.revokedAt).not.toBeNull();
    });

    it("should NOT immediately invalidate access token (stateless)", async () => {
      await createUser();
      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: "session_test@example.com",
        password: "Password123",
      });
      const { accessToken, refreshToken } = loginRes.body.data.tokens;

      await request(app).post("/api/v1/auth/logout").send({ refreshToken });

      const profileRes = await request(app)
        .get("/api/v1/auth/profile")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(profileRes.status).toBe(StatusCodes.OK);
    });

    it("should fail refresh after logout", async () => {
      await createUser();
      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: "session_test@example.com",
        password: "Password123",
      });
      const { refreshToken } = loginRes.body.data.tokens;

      await request(app).post("/api/v1/auth/logout").send({ refreshToken });

      const refreshRes = await request(app)
        .post("/api/v1/auth/refresh-token")
        .send({ refreshToken });

      expect(refreshRes.status).toBe(StatusCodes.UNAUTHORIZED);
    });
  });

  describe("Revoke All Sessions", () => {
    it("should revoke all sessions for the user", async () => {
      const user = await createUser();

      const loginRes1 = await request(app).post("/api/v1/auth/login").send({
        email: "session_test@example.com",
        password: "Password123",
      });
      const token1 = loginRes1.body.data.tokens.accessToken;

      await request(app).post("/api/v1/auth/login").send({
        email: "session_test@example.com",
        password: "Password123",
      });

      const countBefore = await db().userSession.count({
        where: { userId: user.id, revokedAt: null },
      });
      expect(countBefore).toBe(2);

      const revokeRes = await request(app)
        .post("/api/v1/auth/revoke-all")
        .set("Authorization", `Bearer ${token1}`);

      expect(revokeRes.status).toBe(StatusCodes.OK);

      const countAfter = await db().userSession.count({
        where: { userId: user.id, revokedAt: null },
      });
      expect(countAfter).toBe(0);
    });
  });

  describe("Cross-cutting Scenarios", () => {
    it("should support independent multi-device sessions", async () => {
      await createUser();

      const loginA = await request(app).post("/api/v1/auth/login").send({
        email: "session_test@example.com",
        password: "Password123",
      });
      const tokenA = loginA.body.data.tokens.refreshToken;

      const loginB = await request(app).post("/api/v1/auth/login").send({
        email: "session_test@example.com",
        password: "Password123",
      });
      const tokenB = loginB.body.data.tokens.refreshToken;

      await request(app).post("/api/v1/auth/logout").send({ refreshToken: tokenA });

      const refreshA = await request(app)
        .post("/api/v1/auth/refresh-token")
        .send({ refreshToken: tokenA });
      expect(refreshA.status).toBe(StatusCodes.UNAUTHORIZED);

      const refreshB = await request(app)
        .post("/api/v1/auth/refresh-token")
        .send({ refreshToken: tokenB });
      expect(refreshB.status).toBe(StatusCodes.OK);
    });

    it("should prevent refresh for inactive users", async () => {
      const user = await createUser();

      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: "session_test@example.com",
        password: "Password123",
      });
      const { refreshToken } = loginRes.body.data.tokens;

      await db().user.update({
        where: { id: user.id },
        data: { isActive: false },
      });

      const refreshRes = await request(app)
        .post("/api/v1/auth/refresh-token")
        .send({ refreshToken });

      expect(refreshRes.status).toBe(StatusCodes.UNAUTHORIZED);
    });
  });
});
