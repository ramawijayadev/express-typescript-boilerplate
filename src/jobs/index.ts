import { Worker } from "bullmq";
import IORedis from "ioredis";

import { queueConfig } from "@/config/queue";
import { logger } from "@/core/logging/logger";

import { emailWorkerHandler, emailWorkerName } from "./handlers/send-email.job";

let worker: Worker | undefined;

/**
 * Initializes the background job system (BullMQ).
 */
export function initJobs() {
  const redisOpts = {
    host: queueConfig.redis.host,
    port: Number(queueConfig.redis.port),
    maxRetriesPerRequest: null,
  };
  if (queueConfig.redis.password) {
    Object.assign(redisOpts, { password: queueConfig.redis.password });
  }

  const connection = new IORedis(redisOpts);

  worker = new Worker(emailWorkerName, emailWorkerHandler, {
    connection,
    concurrency: 5,
  });

  worker.on("active", (job) => {
    logger.info({ jobId: job.id, jobName: job.name }, "Job started");
  });

  worker.on("completed", (job) => {
    logger.info({ jobId: job.id, jobName: job.name }, "Job completed successfully");
  });

  worker.on("failed", async (job, err) => {
    logger.error({ jobId: job?.id, jobName: job?.name, error: err }, "Job failed");

    // If job has exhausted all retries, move to Dead Letter Queue
    if (job && job.attemptsMade >= (job.opts.attempts ?? 3)) {
      const { jobQueue } = await import("@/core/queue");
      const dlq = jobQueue.getDeadLetterQueue();

      await dlq.add("failed-job", {
        originalQueue: job.queueName,
        originalJobId: job.id,
        jobName: job.name,
        data: job.data,
        error: err.message,
        errorStack: err.stack,
        failedAt: new Date().toISOString(),
        attemptsMade: job.attemptsMade,
      });

      logger.warn(
        { jobId: job.id, jobName: job.name, attempts: job.attemptsMade },
        "Job exhausted all retries, moved to Dead Letter Queue",
      );
    }
  });

  logger.info("Background jobs initialized");
}

/**
 * Gracefully shuts down all job workers.
 * Ensures active jobs are not abruptly interrupted if possible.
 */
export async function shutdownJobs() {
  if (worker) {
    await worker.close();
    logger.info("Job worker closed");
  }
}
