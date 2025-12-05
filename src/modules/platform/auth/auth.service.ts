import { StatusCodes } from "http-status-codes";

import { generateAccessToken, generateRefreshToken, verifyToken } from "@/core/auth/jwt";
import { hashPassword, verifyPassword } from "@/core/auth/password";
import { AppError } from "@/shared/errors/AppError";
import type { AuthRepository } from "./auth.repository";
import type {
  AuthResponse,
  LoginBody,
  ProfileResponse,
  RefreshTokenResponse,
  RegisterBody,
} from "./auth.types";

export class AuthService {
  constructor(private readonly repo: AuthRepository) {}

  async register(data: RegisterBody): Promise<AuthResponse> {
    const existingUser = await this.repo.findByEmail(data.email);
    if (existingUser) {
      throw new AppError(StatusCodes.CONFLICT, "Email already registered");
    }

    const passwordHash = await hashPassword(data.password);
    const user = await this.repo.create({ ...data, passwordHash });

    const tokens = {
      accessToken: generateAccessToken({ userId: user.id }),
      refreshToken: generateRefreshToken({ userId: user.id }),
    };

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      tokens,
    };
  }

  async login(data: LoginBody): Promise<AuthResponse> {
    const user = await this.repo.findByEmail(data.email);
    if (!user) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
    }

    if (!user.password) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
    }

    const isValidPassword = await verifyPassword(user.password, data.password);
    if (!isValidPassword) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
    }

    const tokens = {
      accessToken: generateAccessToken({ userId: user.id }),
      refreshToken: generateRefreshToken({ userId: user.id }),
    };

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      tokens,
    };
  }

  async refreshToken(token: string): Promise<RefreshTokenResponse> {
    try {
      const payload = verifyToken(token);
      const user = await this.repo.findById(payload.userId);

      if (!user) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "User not found");
      }

      const accessToken = generateAccessToken({ userId: user.id });

      return { accessToken };
    } catch (error) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid refresh token");
    }
  }

  async getProfile(userId: number): Promise<ProfileResponse> {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, "User not found");
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }
}
