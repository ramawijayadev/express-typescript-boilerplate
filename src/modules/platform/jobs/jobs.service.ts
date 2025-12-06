import { StatusCodes } from "http-status-codes";

import { logger } from "@/core/logging/logger";
import { AppError } from "@/shared/errors/AppError";

import type { JobsRepository } from "./jobs.repository";
import type { CleanupResponse, FailedJob, FailedJobList } from "./jobs.types";

/**
 * Service for managing failed jobs in the Dead Letter Queue.
 */
export class JobsService {
  /**
   * Creates an instance of JobsService.
   * @param repo - The jobs repository.
   */
  constructor(private readonly repo: JobsRepository) {}

  /**
   * Lists all failed jobs from the Dead Letter Queue.
   *
   * @returns A promise that resolves to the list of failed jobs.
   */
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

  /**
   * Retries a specific failed job.
   *
   * @param id - The ID of the failed job to retry.
   * @returns A promise that resolves when the job is retried.
   * @throws {AppError} 404 - If the job is not found.
   */
  async retryFailedJob(id: string): Promise<void> {
    const job = await this.repo.getFailedJobById(id);
    
    if (!job) {
      throw new AppError(StatusCodes.NOT_FOUND, "Failed job not found");
    }
    
    await this.repo.retryJob(job);
    
    logger.info({ jobId: id, jobName: (job.data as FailedJob).jobName }, "Retried failed job");
  }

  /**
   * Removes a specific failed job from the Dead Letter Queue.
   *
   * @param id - The ID of the failed job to remove.
   * @returns A promise that resolves when the job is removed.
   * @throws {AppError} 404 - If the job is not found.
   */
  async removeFailedJob(id: string): Promise<void> {
    const job = await this.repo.getFailedJobById(id);
    
    if (!job) {
      throw new AppError(StatusCodes.NOT_FOUND, "Failed job not found");
    }
    
    await this.repo.removeJob(job);
    
    logger.info({ jobId: id }, "Removed failed job");
  }

  /**
   * Cleans up old failed jobs based on retention policy.
   *
   * @returns A promise that resolves to the cleanup response.
   */
  async cleanupOldFailedJobs(): Promise<CleanupResponse> {
    const removedCount = await this.repo.cleanupOldJobs();
    
    logger.info({ removedCount }, "Cleaned up old failed jobs");
    
    return {
      removedCount,
      message: `Removed ${removedCount} old failed job(s)`,
    };
  }
}
