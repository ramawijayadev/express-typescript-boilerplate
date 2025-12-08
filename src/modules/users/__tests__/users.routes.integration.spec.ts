import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { createApp } from "@/app/app";
import { generateAccessToken } from "@/core/auth/jwt";
import { db } from "@/core/database/connection";

describe("Users Routes Integration", () => {
  let token: string;
  let userId: number;
  const app = createApp();

  beforeEach(async () => {
    const user = await db().user.create({
      data: {
        name: "Test User",
        email: `test-users-${Date.now()}@example.com`,
        password: "hashed_password",
      },
    });
    userId = user.id;
    token = generateAccessToken({ userId, email: "test@example.com" });
  });

  describe("GET /api/v1/users/me", () => {
    it("should return user profile", async () => {
      const res = await request(app)
        .get("/api/v1/users/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBeDefined();
      expect(res.body.data.id).toBe(userId);
    });

    it("should return 401 without token", async () => {
      const res = await request(app).get("/api/v1/users/me");
      expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
    });
  });

  describe("PATCH /api/v1/users/me", () => {
    it("should update user name", async () => {
      const newName = "Updated Name";
      const res = await request(app)
        .patch("/api/v1/users/me")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: newName });

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.data.name).toBe(newName);

      const updated = await db().user.findUnique({ where: { id: userId } });
      expect(updated?.name).toBe(newName);
    });
  });
});
