import { queueConfig } from "@/config/queue";
import { jobQueue } from "@/core/queue";

import type { FailedJob } from "./jobs.types";
import type { Job } from "bullmq";

export class JobsRepository {
  async getFailedJobs(): Promise<Job[]> {
    const dlq = jobQueue.getDeadLetterQueue();
    const jobs = await dlq.getJobs(["completed", "failed", "waiting", "active"], 0, -1);
    return jobs;
  }

  async getFailedJobById(id: string): Promise<Job | null> {
    const dlq = jobQueue.getDeadLetterQueue();
    const job = await dlq.getJob(id);
    return job ?? null;
  }

  async retryJob(job: Job): Promise<void> {
    const _originalQueue = (job.data as FailedJob).originalQueue;
    const queue = jobQueue.getQueue();

    await queue.add((job.data as FailedJob).jobName, (job.data as FailedJob).data);
    await job.remove();
  }

  async removeJob(job: Job): Promise<void> {
    await job.remove();
  }

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
