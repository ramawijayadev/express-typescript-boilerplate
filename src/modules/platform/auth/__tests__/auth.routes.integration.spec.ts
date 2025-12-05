import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { createApp } from "@/app/app";
import { hashPassword } from "@/core/auth/password";
import { db } from "@/core/database/connection";
import { AuthRepository } from "../auth.repository";

describe("Auth routes (integration)", () => {
  const app = createApp();
  const authRepository = new AuthRepository();

  beforeEach(async () => {
    await db().user.deleteMany();
  });

  afterAll(async () => {
    await db().user.deleteMany();
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
  });

  describe("POST /auth/logout", () => {
    let accessToken: string;

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

      accessToken = loginResponse.body.data.tokens.accessToken;
    });

    it("should successfully logout", async () => {
      const response = await request(app)
        .post("/api/v1/auth/logout")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(StatusCodes.OK);
    });
  });
});
