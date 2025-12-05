import { Router } from "express";

import { authRouter } from "@/modules/platform/auth/auth.routes";
import { exampleRouter } from "@/modules/platform/example/example.routes";
import { healthRouter } from "@/modules/platform/health/health.routes";

import type { Express } from "express";

export function registerRoutes(app: Express) {
  const api = Router();

  api.use("/", healthRouter);

  api.use("/auth", authRouter);
  api.use("/platform/examples", exampleRouter);

  app.use("/api/v1", api);
}
