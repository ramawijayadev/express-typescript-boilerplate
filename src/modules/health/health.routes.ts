import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Router } from "express";
import { z } from "zod";

import { ok } from "@/shared/http/api-response";
import { createApiResponse } from "@/shared/open-api/openapi-response-builders";

export const healthRegistry = new OpenAPIRegistry();
export const healthRouter = Router();

export const HealthSchema = z.object({
  status: z.string(),
  version: z.string(),
  timestamp: z.string().datetime(),
  jobs: z
    .object({
      failedJobCount: z.number(),
      alert: z.string().optional(),
    })
    .optional(),
});

healthRegistry.registerPath({
  method: "get",
  path: "/health",
  tags: ["Health"],
  responses: createApiResponse(HealthSchema, "Server health status"),
});

healthRouter.get("/health", async (_req, res) => {
  let jobsHealth;

  try {
    const { jobQueue } = await import("@/core/queue");
    const { queueConfig } = await import("@/config/queue");
    const dlq = jobQueue.getDeadLetterQueue();
    const failedJobs = await dlq.getJobCounts("completed", "failed", "waiting", "active");
    const totalFailed = Object.values(failedJobs).reduce((sum, count) => sum + count, 0);

    jobsHealth = {
      failedJobCount: totalFailed,
      ...(totalFailed >= queueConfig.failedJobAlertThreshold
        ? { alert: `Failed job count exceeds threshold (${queueConfig.failedJobAlertThreshold})` }
        : {}),
    };
  } catch {
    jobsHealth = undefined;
  }

  return ok(res, {
    status: "Server up and running gracefully!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    ...(jobsHealth ? { jobs: jobsHealth } : {}),
  });
});
