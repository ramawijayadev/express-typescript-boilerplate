import { Router } from "express";

import { exampleRouter } from "@/modules/business/example/example.routes";
import { authRouter } from "@/modules/platform/auth/auth.routes";
import { healthRouter } from "@/modules/platform/health/health.routes";

import type { Express } from "express";

export function registerRoutes(app: Express) {
  const api = Router();

  api.use("/", healthRouter);

  api.use("/auth", authRouter);
  api.use("/examples", exampleRouter);

  app.use("/api/v1", api);
}
