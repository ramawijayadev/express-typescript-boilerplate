/**
 * Unit tests for AuthService.
 */
import { StatusCodes } from "http-status-codes";
import { describe, expect, it, vi } from "vitest";

import { type User } from "@/generated/prisma";
import { AppError } from "@/shared/errors/AppError";

import { AuthRepository } from "../auth.repository";
import { AuthService } from "../auth.service";

vi.mock("../auth.repository");

vi.mock("@/core/auth/jwt", () => ({
  generateAccessToken: vi.fn(() => "access_token"),
  generateRefreshToken: vi.fn(() => "valid_refresh_token"),
  verifyToken: vi.fn((token) => {
    if (token === "access_token") return { userId: 1 };
    throw new Error("Invalid token");
  }),
  verifyRefreshToken: vi.fn((token) => {
    if (token === "valid_refresh_token") return { userId: 1 };
    throw new Error("Invalid token");
  }),
}));

vi.mock("@/core/auth/password", () => ({
  hashPassword: vi.fn(() => Promise.resolve("hashed_password")),
  verifyPassword: vi.fn((hash, plain) => Promise.resolve(plain === "Password123")),
}));

describe("Auth service (unit)", () => {
  const makeService = () => {
    const repo = new AuthRepository();

    repo.create = vi.fn();
    repo.findByEmail = vi.fn();
    repo.findById = vi.fn();

    const service = new AuthService(repo);
    return { service, repo };
  };

  describe("register", () => {
    it("should register new user and return tokens", async () => {
      const { service, repo } = makeService();
      vi.mocked(repo.findByEmail).mockResolvedValue(null);
      const mockUser = {
        id: 1,
        name: "Test",
        email: "test@example.com",
        password: "hashed_password",
        isActive: true,
        emailVerifiedAt: null,
        lastLoginAt: null,
        createdBy: null,
        updatedBy: null,
        deletedBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
        passwordChangedAt: null,
      };
      vi.mocked(repo.create).mockResolvedValue(mockUser);

      const result = await service.register({
        name: "Test",
        email: "test@example.com",
        password: "Password123",
      });

      expect(repo.findByEmail).toHaveBeenCalledWith("test@example.com");
      expect(repo.create).toHaveBeenCalled();
      expect(result.tokens).toHaveProperty("accessToken", "access_token");
      expect(result.tokens).toHaveProperty("refreshToken", "valid_refresh_token");
    });

    it("should throw CONFLICT if email exists", async () => {
      const { service, repo } = makeService();
      vi.mocked(repo.findByEmail).mockResolvedValue({ id: 1 } as unknown as User);

      const promise = service.register({
        name: "Test",
        email: "test@example.com",
        password: "Password123",
      });

      await expect(promise).rejects.toBeInstanceOf(AppError);
      await expect(promise).rejects.toMatchObject({
        statusCode: StatusCodes.CONFLICT,
        message: "Email already registered",
      });
    });
  });

  describe("login", () => {
    it("should login with correct credentials", async () => {
      const { service, repo } = makeService();
      const mockUser = {
        id: 1,
        name: "Test",
        email: "test@example.com",
        password: "hashed_password",
        isActive: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
      } as unknown as User;
      vi.mocked(repo.findByEmail).mockResolvedValue(mockUser);

      const result = await service.login({
        email: "test@example.com",
        password: "Password123",
      });

      expect(result.tokens).toBeDefined();
    });

    it("should throw UNAUTHORIZED for wrong password", async () => {
      const { service, repo } = makeService();
      const mockUser = {
        id: 1,
        name: "Test",
        email: "test@example.com",
        password: "hashed_password",
        isActive: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
      } as unknown as User;
      vi.mocked(repo.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(repo.incrementFailedLogin).mockResolvedValue({
        ...mockUser,
        failedLoginAttempts: 1,
      });

      const promise = service.login({
        email: "test@example.com",
        password: "WrongPassword",
      });

      await expect(promise).rejects.toBeInstanceOf(AppError);
      await expect(promise).rejects.toMatchObject({
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    });
  });
});
