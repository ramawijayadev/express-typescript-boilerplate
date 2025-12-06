import { queueConfig } from "@/config/queue";
import { logger } from "@/core/logging/logger";
import { jobQueue } from "@/core/queue";

/**
 * Cleanup old failed jobs from the Dead Letter Queue.
 * Removes jobs older than the configured retention period.
 */
export async function cleanupFailedJobs(): Promise<void> {
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
  
  logger.info(
    { removedCount, retentionDays: queueConfig.failedJobRetentionDays },
    "Cleaned up old failed jobs",
  );
}
