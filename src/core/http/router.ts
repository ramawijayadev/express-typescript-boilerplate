import { Router } from "express";

import { exampleRouter } from "@/modules/business/example/example.routes";
import { authRouter } from "@/modules/platform/auth/auth.routes";
import { healthRouter } from "@/modules/platform/health/health.routes";
import { jobsRouter } from "@/modules/platform/jobs/jobs.routes";
import { usersRouter } from "@/modules/platform/users/users.routes";

import type { Express } from "express";

export function registerRoutes(app: Express) {
  const api = Router();

  api.use("/", healthRouter);

  api.use("/auth", authRouter);
  api.use("/users", usersRouter);
  api.use("/jobs", jobsRouter);
  api.use("/examples", exampleRouter);

  app.use("/api/v1", api);
}
