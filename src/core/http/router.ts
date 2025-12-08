import { Router } from "express";

import { authRouter } from "@/modules/auth/auth.routes";
import { exampleRouter } from "@/modules/example/example.routes";
import { healthRouter } from "@/modules/health/health.routes";
import { jobsRouter } from "@/modules/jobs/jobs.routes";
import { usersRouter } from "@/modules/users/users.routes";

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
