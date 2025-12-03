import { Router } from "express";

import { exampleRouter } from "@/modules/platform/example/example.routes";
import { ok } from "@/shared/http/api-response";
import { testResponsesRouter } from "@/shared/http/test-responses.routes";

import type { Express } from "express";

export function registerRoutes(app: Express) {
  const api = Router();

  api.get("/health", (_req, res) => {
    return ok(res, {
      status: "Server up and running gracefully!",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    });
  });

  api.use("/platform/examples", exampleRouter);

  if (process.env.NODE_ENV === "test") {
    api.use("/_test/responses", testResponsesRouter);
  }

  app.use("/api/v1", api);
}
