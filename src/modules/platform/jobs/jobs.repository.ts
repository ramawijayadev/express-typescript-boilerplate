import { queueConfig } from "@/config/queue";
import { jobQueue } from "@/core/queue";

import type { FailedJob } from "./jobs.types";
import type { Job } from "bullmq";

/**
 * Repository for managing failed jobs in the Dead Letter Queue.
 */
export class JobsRepository {
  /**
   * Gets all failed jobs from the Dead Letter Queue.
   */
  async getFailedJobs(): Promise<Job[]> {
    const dlq = jobQueue.getDeadLetterQueue();
    const jobs = await dlq.getJobs(["completed", "failed", "waiting", "active"], 0, -1);
    return jobs;
  }

  /**
   * Gets a specific failed job by ID.
   */
  async getFailedJobById(id: string): Promise<Job | null> {
    const dlq = jobQueue.getDeadLetterQueue();
    const job = await dlq.getJob(id);
    return job ?? null;
  }

  /**
   * Retries a failed job by re-enqueueing it to the original queue.
   */
  async retryJob(job: Job): Promise<void> {
    const _originalQueue = (job.data as FailedJob).originalQueue;
    const queue = jobQueue.getQueue(); // For now we only have email queue

    await queue.add((job.data as FailedJob).jobName, (job.data as FailedJob).data);
    await job.remove();
  }

  /**
   * Removes a failed job from the Dead Letter Queue.
   */
  async removeJob(job: Job): Promise<void> {
    await job.remove();
  }

  /**
   * Cleans up old failed jobs based on retention policy.
   */
  async cleanupOldJobs(): Promise<number> {
    const dlq = jobQueue.getDeadLetterQueue();
    const jobs = await dlq.getJobs(["completed", "failed", "waiting", "active"], 0, -1);

    const retentionMs = queueConfig.failedJobRetentionDays * 24 * 60 * 60 * 1000;
    const cutoffDate = Date.now() - retentionMs;

    let removedCount = 0;

    for (const job of jobs) {
      if (job.timestamp && job.timestamp < cutoffDate) {
        await job.remove();
        removedCount++;
      }
    }

    return removedCount;
  }
}
