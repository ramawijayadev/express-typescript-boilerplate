import { ok } from "@/shared/http/api-response";

import type { JobsService } from "./jobs.service";
import type { Request, Response } from "express";

/**
 * Controller for handling job management requests.
 */
export class JobsController {
  constructor(private readonly service: JobsService) {}

  /**
   * Lists all failed jobs.
   */
  async listFailedJobs(_req: Request, res: Response) {
    const result = await this.service.listFailedJobs();
    return ok(res, result);
  }

  /**
   * Retries a specific failed job.
   */
  async retryFailedJob(req: Request, res: Response) {
    await this.service.retryFailedJob(req.params.id!);
    return ok(res, { message: "Job retry enqueued successfully" });
  }

  /**
   * Removes a specific failed job.
   */
  async removeFailedJob(req: Request, res: Response) {
    await this.service.removeFailedJob(req.params.id!);
    return ok(res, { message: "Failed job removed successfully" });
  }

  /**
   * Cleans up old failed jobs.
   */
  async cleanupOldFailedJobs(_req: Request, res: Response) {
    const result = await this.service.cleanupOldFailedJobs();
    return ok(res, result);
  }
}
