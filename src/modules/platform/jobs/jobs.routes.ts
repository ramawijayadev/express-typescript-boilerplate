import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Router } from "express";
import { z } from "zod";

import { authenticate } from "@/core/http/middlewares/authenticate.middleware";
import { createApiResponse } from "@/shared/open-api/openapi-response-builders";

import { JobsController } from "./jobs.controller";
import { JobsRepository } from "./jobs.repository";
import { CleanupResponseSchema, FailedJobListSchema } from "./jobs.schemas";
import { JobsService } from "./jobs.service";

export const jobsRegistry = new OpenAPIRegistry();
export const jobsRouter = Router();

const repo = new JobsRepository();
const service = new JobsService(repo);
const controller = new JobsController(service);

// All routes require authentication
jobsRouter.use(authenticate);

/**
 * GET /jobs/failed
 * List all failed jobs in the Dead Letter Queue
 */
jobsRouter.get("/failed", (req, res) => controller.listFailedJobs(req, res));

jobsRegistry.registerPath({
  method: "get",
  path: "/jobs/failed",
  tags: ["Jobs"],
  summary: "List all failed jobs",
  description: "Retrieves all jobs that have exhausted their retry attempts and moved to the Dead Letter Queue",
  responses: createApiResponse(FailedJobListSchema, "Failed jobs list", 200, [401, 500]),
  security: [{ bearerAuth: [] }],
});

/**
 * POST /jobs/failed/:id/retry
 * Retry a specific failed job
 */
jobsRouter.post("/failed/:id/retry", (req, res) => controller.retryFailedJob(req, res));

jobsRegistry.registerPath({
  method: "post",
  path: "/jobs/failed/{id}/retry",
  tags: ["Jobs"],
  summary: "Retry a failed job",
  description: "Re-enqueues a failed job from the Dead Letter Queue back to its original queue",
  request: {
    params: z.object({
      id: z.string().openapi({ description: "The ID of the failed job to retry" }),
    }),
  },
  responses: createApiResponse(
    z.object({ message: z.string() }),
    "Retry confirmation",
    200,
    [401, 404, 500],
  ),
  security: [{ bearerAuth: [] }],
});

/**
 * DELETE /jobs/failed/:id
 * Remove a specific failed job
 */
jobsRouter.delete("/failed/:id", (req, res) => controller.removeFailedJob(req, res));

jobsRegistry.registerPath({
  method: "delete",
  path: "/jobs/failed/{id}",
  tags: ["Jobs"],
  summary: "Remove a failed job",
  description: "Permanently removes a failed job from the Dead Letter Queue",
  request: {
    params: z.object({
      id: z.string().openapi({ description: "The ID of the failed job to remove" }),
    }),
  },
  responses: createApiResponse(
    z.object({ message: z.string() }),
    "Removal confirmation",
    200,
    [401, 404, 500],
  ),
  security: [{ bearerAuth: [] }],
});

/**
 * DELETE /jobs/failed
 * Cleanup old failed jobs based on retention policy
 */
jobsRouter.delete("/failed", (req, res) => controller.cleanupOldFailedJobs(req, res));

jobsRegistry.registerPath({
  method: "delete",
  path: "/jobs/failed",
  tags: ["Jobs"],
  summary: "Cleanup old failed jobs",
  description: `Removes failed jobs older than the configured retention period (default: 7 days)`,
  responses: createApiResponse(CleanupResponseSchema, "Cleanup result", 200, [401, 500]),
  security: [{ bearerAuth: [] }],
});
