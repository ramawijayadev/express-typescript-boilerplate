import { ok } from "@/shared/http/api-response";

import type { JobsService } from "./jobs.service";
import type { Request, Response } from "express";

export class JobsController {
  constructor(private readonly service: JobsService) {}

  async listFailedJobs(_req: Request, res: Response) {
    const result = await this.service.listFailedJobs();
    return ok(res, result);
  }

  async retryFailedJob(req: Request, res: Response) {
    await this.service.retryFailedJob(req.params.id!);
    return ok(res, { message: "Job retry enqueued successfully" });
  }

  async removeFailedJob(req: Request, res: Response) {
    await this.service.removeFailedJob(req.params.id!);
    return ok(res, { message: "Failed job removed successfully" });
  }

  async cleanupOldFailedJobs(_req: Request, res: Response) {
    const result = await this.service.cleanupOldFailedJobs();
    return ok(res, result);
  }
}
