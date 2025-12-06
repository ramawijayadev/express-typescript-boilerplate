import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "@/app/app";
import { logger } from "@/core/logging/logger";

describe("Logging System Integration", () => {
  const app = createApp((app) => {
    app.get("/test-logging", (req, res) => {
      logger.info("Test log inside route");
      res.json({ message: "Hello", requestId: req.requestId });
    });

    app.get("/test-error", () => {
      throw new Error("Test intentional error");
    });
  });

  it("should return requestId in response and generic success", async () => {
    const res = await request(app).get("/test-logging");

    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body.requestId).toBeDefined();

    expect(res.body.requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it("should handle errors globally and return safe response with requestId", async () => {
    const res = await request(app).get("/test-error");

    expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Internal server error");
    expect(res.body.requestId).toBeDefined();
  });
});
