/**
 * Integration tests for Auth Routes.
 */
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createApp } from "@/app/app";
import { hashPassword } from "@/core/auth/password";
import { db } from "@/core/database/connection";

import { AuthRepository } from "../auth.repository";

vi.mock("@/core/queue", () => ({
  jobQueue: {
    enqueueEmailVerification: vi.fn(),
    enqueuePasswordReset: vi.fn(),
  },
}));

describe("Auth routes (integration)", () => {
  let app: ReturnType<typeof createApp>;
  const authRepository = new AuthRepository();

  beforeEach(() => {
    app = createApp();
  });

  describe("POST /auth/register", () => {
    it("should register a new user and return tokens", async () => {
      const payload = {
        name: "Test User",
        email: "register_test@example.com",
        password: "Password123",
      };

      const response = await request(app).post("/api/v1/auth/register").send(payload);

      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toMatchObject({
        name: payload.name,
        email: payload.email,
      });
      expect(response.body.data.tokens).toHaveProperty("accessToken");
      expect(response.body.data.tokens).toHaveProperty("refreshToken");

      const user = await authRepository.findByEmail(payload.email);
      expect(user).toBeDefined();
    });

    it("should fail if email already exists", async () => {
      await authRepository.create({
        name: "Existing User",
        email: "existing@example.com",
        passwordHash: "hash",
      });

      const payload = {
        name: "Test User",
        email: "existing@example.com",
        password: "Password123",
      };

      const response = await request(app).post("/api/v1/auth/register").send(payload);

      expect(response.status).toBe(StatusCodes.CONFLICT);
    });

    it("should fail if required fields are missing", async () => {
      const payload = {
        email: "missing_fields@example.com",
      };

      const response = await request(app).post("/api/v1/auth/register").send(payload);

      expect(response.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
    });

    it("should fail if email format is invalid", async () => {
      const payload = {
        name: "Invalid Email",
        email: "not-an-email",
        password: "Password123",
      };

      const response = await request(app).post("/api/v1/auth/register").send(payload);

      expect(response.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
    });
  });

  describe("POST /auth/login", () => {
    beforeEach(async () => {
      const passwordHash = await hashPassword("Password123");
      await authRepository.create({
        name: "Test User",
        email: "login_test@example.com",
        passwordHash,
      });
    });

    it("should login with correct credentials", async () => {
      const payload = {
        email: "login_test@example.com",
        password: "Password123",
      };

      const response = await request(app).post("/api/v1/auth/login").send(payload);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tokens).toHaveProperty("accessToken");
      expect(response.body.data.tokens).toHaveProperty("refreshToken");
    });

    it("should fail with incorrect password", async () => {
      const payload = {
        email: "login_test@example.com",
        password: "WrongPassword",
      };

      const response = await request(app).post("/api/v1/auth/login").send(payload);

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });

    it("should fail if user does not exist", async () => {
      const payload = {
        email: "ghost@example.com",
        password: "Password123",
      };

      const response = await request(app).post("/api/v1/auth/login").send(payload);

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });

    it("should fail if user is inactive", async () => {
      const passwordHash = await hashPassword("Password123");
      await db().user.create({
        data: {
          name: "Inactive User",
          email: "inactive@example.com",
          password: passwordHash,
          isActive: false,
        },
      });

      const payload = {
        email: "inactive@example.com",
        password: "Password123",
      };

      const response = await request(app).post("/api/v1/auth/login").send(payload);

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });
  });

  describe("GET /auth/profile", () => {
    let accessToken: string;

    beforeEach(async () => {
      const passwordHash = await hashPassword("Password123");
      await authRepository.create({
        name: "Test User",
        email: "profile_test@example.com",
        passwordHash,
      });

      const loginResponse = await request(app).post("/api/v1/auth/login").send({
        email: "profile_test@example.com",
        password: "Password123",
      });

      accessToken = loginResponse.body.data.tokens.accessToken;
    });

    it("should return profile for authenticated user", async () => {
      const response = await request(app)
        .get("/api/v1/auth/profile")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.data.user.email).toBe("profile_test@example.com");
    });

    it("should fail without token", async () => {
      const response = await request(app).get("/api/v1/auth/profile");
      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });

    it("should fail with malformed token", async () => {
      const response = await request(app)
        .get("/api/v1/auth/profile")
        .set("Authorization", "Bearer invalid.token.structure");

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });

    it("should fail with wrong auth scheme", async () => {
      const response = await request(app)
        .get("/api/v1/auth/profile")
        .set("Authorization", "Token somevalidtoken");

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });
  });

  describe("POST /auth/refresh-token", () => {
    let refreshToken: string;

    beforeEach(async () => {
      const passwordHash = await hashPassword("Password123");
      await authRepository.create({
        name: "Test User",
        email: "refresh_test@example.com",
        passwordHash,
      });

      const loginResponse = await request(app).post("/api/v1/auth/login").send({
        email: "refresh_test@example.com",
        password: "Password123",
      });

      refreshToken = loginResponse.body.data.tokens.refreshToken;
    });

    it("should return new access token", async () => {
      const response = await request(app).post("/api/v1/auth/refresh-token").send({ refreshToken });

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.data).toHaveProperty("accessToken");
    });

    it("should fail with invalid refresh token", async () => {
      const response = await request(app)
        .post("/api/v1/auth/refresh-token")
        .send({ refreshToken: "invalid_token" });

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });

    it("should fail with empty body", async () => {
      const response = await request(app).post("/api/v1/auth/refresh-token").send({});

      expect(response.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
    });
  });

  describe("POST /auth/logout", () => {
    let refreshToken: string;

    beforeEach(async () => {
      const passwordHash = await hashPassword("Password123");
      await authRepository.create({
        name: "Test User",
        email: "logout_test@example.com",
        passwordHash,
      });

      const loginResponse = await request(app).post("/api/v1/auth/login").send({
        email: "logout_test@example.com",
        password: "Password123",
      });

      refreshToken = loginResponse.body.data.tokens.refreshToken;
    });

    it("should successfully logout", async () => {
      const response = await request(app).post("/api/v1/auth/logout").send({ refreshToken });

      expect(response.status).toBe(StatusCodes.OK);
    });

    it("should fail with invalid refresh token", async () => {
      const response = await request(app)
        .post("/api/v1/auth/logout")
        .send({ refreshToken: "invalid_token" });

      expect(response.status).not.toBe(StatusCodes.OK);
    });
  });
});
