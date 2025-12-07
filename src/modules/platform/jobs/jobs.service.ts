import { StatusCodes } from "http-status-codes";

import { logger } from "@/core/logging/logger";
import { AppError } from "@/shared/errors/AppError";

import type { JobsRepository } from "./jobs.repository";
import type { CleanupResponse, FailedJob, FailedJobList } from "./jobs.types";

export class JobsService {
  constructor(private readonly repo: JobsRepository) {}

  async listFailedJobs(): Promise<FailedJobList> {
    const jobs = await this.repo.getFailedJobs();

    const failedJobs: FailedJob[] = jobs.map((job) => ({
      id: job.id!,
      jobName: (job.data as FailedJob).jobName,
      originalQueue: (job.data as FailedJob).originalQueue,
      originalJobId: (job.data as FailedJob).originalJobId,
      data: (job.data as FailedJob).data,
      error: (job.data as FailedJob).error,
      errorStack: (job.data as FailedJob).errorStack,
      failedAt: (job.data as FailedJob).failedAt,
      attemptsMade: (job.data as FailedJob).attemptsMade,
      timestamp: job.timestamp,
    }));

    return {
      jobs: failedJobs,
      total: failedJobs.length,
    };
  }

  async retryFailedJob(id: string): Promise<void> {
    const job = await this.repo.getFailedJobById(id);

    if (!job) {
      throw new AppError(StatusCodes.NOT_FOUND, "Failed job not found");
    }

    await this.repo.retryJob(job);

    logger.info({ jobId: id, jobName: (job.data as FailedJob).jobName }, "Retried failed job");
  }

  async removeFailedJob(id: string): Promise<void> {
    const job = await this.repo.getFailedJobById(id);

    if (!job) {
      throw new AppError(StatusCodes.NOT_FOUND, "Failed job not found");
    }

    await this.repo.removeJob(job);

    logger.info({ jobId: id }, "Removed failed job");
  }

  async cleanupOldFailedJobs(): Promise<CleanupResponse> {
    const removedCount = await this.repo.cleanupOldJobs();

    logger.info({ removedCount }, "Cleaned up old failed jobs");

    return {
      removedCount,
      message: `Removed ${removedCount} old failed job(s)`,
    };
  }
}
