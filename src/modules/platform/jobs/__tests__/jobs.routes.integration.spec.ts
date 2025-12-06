/**
 * Integration tests for Jobs Routes.
 * Tests the complete flow of managing failed jobs via API endpoints.
 */
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createApp } from "@/app/app";
import { generateAccessToken } from "@/core/auth/jwt";
import { db } from "@/core/database/connection";
import { jobQueue } from "@/core/queue";

describe("Jobs Routes Integration", () => {
  let token: string;
  let userId: number;
  const app = createApp();

  beforeAll(async () => {
    try {
      // Create a test user
      const user = await db().user.create({
        data: {
          name: "Test User",
          email: `test-jobs-${Date.now()}@example.com`,
          password: "hashed_password",
        },
      });
      userId = user.id;
      token = generateAccessToken({ userId });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Test setup failed:", error);
      throw error;
    }
  });

  afterAll(async () => {
    await db().user.deleteMany({ where: { email: { contains: "test-jobs-" } } });
    
    // Clean up any test jobs
    const dlq = jobQueue.getDeadLetterQueue();
    const jobs = await dlq.getJobs(["completed", "failed", "waiting", "active"], 0, -1);
    for (const job of jobs) {
      await job.remove();
    }
  });

  describe("GET /api/v1/jobs/failed", () => {
    it("should return list of failed jobs", async () => {
      const res = await request(app)
        .get("/api/v1/jobs/failed")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("jobs");
      expect(res.body.data).toHaveProperty("total");
      expect(Array.isArray(res.body.data.jobs)).toBe(true);
    });

    it("should return 401 without authentication", async () => {
      const res = await request(app).get("/api/v1/jobs/failed");

      expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
    });
  });

  describe("POST /api/v1/jobs/failed/:id/retry", () => {
    it("should return 404 for non-existent job", async () => {
      const res = await request(app)
        .post("/api/v1/jobs/failed/non-existent-id/retry")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Failed job not found");
    });

    it("should return 401 without authentication", async () => {
      const res = await request(app).post("/api/v1/jobs/failed/some-id/retry");

      expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
    });
  });

  describe("DELETE /api/v1/jobs/failed/:id", () => {
    it("should return 404 for non-existent job", async () => {
      const res = await request(app)
        .delete("/api/v1/jobs/failed/non-existent-id")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 without authentication", async () => {
      const res = await request(app).delete("/api/v1/jobs/failed/some-id");

      expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
    });
  });

  describe("DELETE /api/v1/jobs/failed", () => {
    it("should cleanup old failed jobs", async () => {
      const res = await request(app)
        .delete("/api/v1/jobs/failed")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("removedCount");
      expect(res.body.data).toHaveProperty("message");
      expect(typeof res.body.data.removedCount).toBe("number");
    });

    it("should return 401 without authentication", async () => {
      const res = await request(app).delete("/api/v1/jobs/failed");

      expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
    });
  });
});
