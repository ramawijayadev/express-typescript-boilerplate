import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "@/app/app";

describe("Example module - error mapping", () => {
  it("should map AppError from service into standardized 404 response", async () => {
    const app = createApp();

    const res = await request(app)
      .get("/api/v1/platform/examples/999999")
      .expect(StatusCodes.NOT_FOUND);

    expect(res.body).toEqual({
      success: false,
      message: "Example not found",
      statusCode: StatusCodes.NOT_FOUND,
      requestId: expect.any(String),
    });
  });
});
