import { Worker } from "bullmq";
import IORedis from "ioredis";

import { queueConfig } from "@/config/queue";
import { logger } from "@/core/logging/logger";
import { emailWorkerHandler, emailWorkerName } from "./handlers/send-email.job";

export function initJobs() {
  const connection = new IORedis({
    host: queueConfig.redis.host,
    port: queueConfig.redis.port,
    password: queueConfig.redis.password,
    maxRetriesPerRequest: null,
  });

  const worker = new Worker(emailWorkerName, emailWorkerHandler, {
    connection,
    concurrency: 5,
  });

  worker.on("completed", (job) => {
    logger.info({ jobId: job.id, jobName: job.name }, "Job completed successfully");
  });

  worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, jobName: job?.name, error: err }, "Job failed");
  });
  
  logger.info("Background jobs initialized");
}
