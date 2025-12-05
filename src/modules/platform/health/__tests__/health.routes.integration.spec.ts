import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "@/app/app";

describe("Health endpoint", () => {
  it("should return standard success format", async () => {
    const app = createApp();

    const res = await request(app).get("/api/v1/health").expect(200);

    expect(res.body).toMatchObject({
      success: true,
      message: "OK",
      statusCode: 200,
      data: {
        status: "Server up and running gracefully!",
        version: "1.0.0",
        timestamp: expect.any(String),
      },
    });

    expect(typeof res.body.data.status).toBe("string");
    expect(typeof res.body.data.version).toBe("string");
    expect(typeof res.body.data.timestamp).toBe("string");
  });
});
