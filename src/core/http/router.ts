import { Router } from "express";

import { exampleRouter } from "@/modules/platform/example/example.routes";
import { ok } from "@/shared/http/api-response";

import type { Express } from "express";

export function registerRoutes(app: Express) {
  const api = Router();

  api.get("/health", (_req, res) => {
    return ok(res, {
      status: "Server up and running gracefully!",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    });
  });

  api.use("/platform/examples", exampleRouter);

  app.use("/api/v1", api);
}
